import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  StudySchedule,
  StudyScheduleDocument,
} from '../../domain/entities/study-schedule.entity';
import { DatService } from '../dat/dat.service';

@Injectable()
export class StudyScheduleCronService {
  private readonly logger = new Logger(StudyScheduleCronService.name);

  constructor(
    @InjectModel(StudySchedule.name)
    private studyScheduleModel: Model<StudyScheduleDocument>,
    private datService: DatService,
  ) {}

  @Cron(CronExpression.EVERY_MINUTE)
  async handleCron() {
    this.logger.debug(
      'Đang kiểm tra Lịch học để gán/thu hồi thiết bị DAT tự động...',
    );
    const now = new Date();

    // 1. Tìm các lịch học chưa kết thúc (đang diễn ra hoặc sắp diễn ra)
    // Sắp xếp theo start_time tăng dần để lấy ca học gần nhất
    // Lấy các ca học từ 48 giờ trước đến tương lai để có thể tự chữa lành (self-heal)
    const yesterday = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate() - 1,
    );
    const relevantSchedules = await this.studyScheduleModel.find({
      date_register: { $gte: yesterday },
      dat_id: { $exists: true, $ne: null },
      teacher_id: { $exists: true, $ne: null },
      status: { $nin: ['CANCELLED', 'COMPLETED'] },
    });

    const getShiftTimes = (s: StudyScheduleDocument) => {
      if (!s.date_register) return { start: 0, end: 0 };
      const date = new Date(s.date_register);
      let startHour = 0;
      let endHour = 0;
      if (s.shift === 'morning') {
        startHour = 6;
        endHour = 12;
      }
      // Format lại khối lệnh để dễ đọc hơn và chuẩn coding style
      else if (s.shift === 'afternoon') {
        startHour = 12;
        endHour = 18;
      }
      // Tách khối lệnh else if thành nhiều dòng để dễ đọc hơn và đồng nhất format
      else if (s.shift === 'evening') {
        startHour = 18;
        endHour = 23;
      }
      // [FIX] Thêm else block: chỉ trả về 0 khi shift không hợp lệ
      else {
        return { start: 0, end: 0 };
      }

      // Tách các tham số của Date thành nhiều dòng để dễ đọc hơn
      const start = new Date(
        date.getFullYear(),
        date.getMonth(),
        date.getDate(),
        startHour,
        0,
        0,
      ).getTime();
      const end = new Date(
        date.getFullYear(),
        date.getMonth(),
        date.getDate(),
        endHour,
        0,
        0,
      ).getTime();
      return { start, end };
    };

    const getScore = (s: StudyScheduleDocument) => {
      const { start, end } = getShiftTimes(s);
      if (!start) return -1;
      const current = now.getTime();

      if (start <= current && current < end) {
        return 3; // Đang diễn ra - Ưu tiên cao nhất
      } else if (start > current) {
        return 2; // Sắp diễn ra
      } else {
        return 1; // Đã kết thúc
      }
    };

    const nearestSchedules = new Map<number, StudyScheduleDocument>();

    for (const schedule of relevantSchedules) {
      if (!schedule.dat_id || !schedule.teacher_id) continue;

      // [FIX] Bỏ qua các ca học trong tương lai (chỉ xét ca đang diễn ra hoặc đã kết thúc)
      // Để đảm bảo không gán sớm thiết bị khi chưa tới ca, và có thể quay về ca trước đó nếu ca hiện tại bị xóa
      const score = getScore(schedule);
      if (score === 2) continue;

      const currentBest = nearestSchedules.get(schedule.dat_id);

      if (!currentBest) {
        nearestSchedules.set(schedule.dat_id, schedule);
      } else {
        const bestScore = getScore(currentBest);

        if (score > bestScore) {
          nearestSchedules.set(schedule.dat_id, schedule);
        } else if (score === bestScore) {
          // Cùng mức ưu tiên, chọn cái phù hợp nhất
          if (score === 1) {
            // Đã kết thúc: chọn cái end gần nhất (lớn nhất)
            const sEnd = getShiftTimes(schedule).end;
            const cEnd = getShiftTimes(currentBest).end;
            if (sEnd > cEnd) {
              nearestSchedules.set(schedule.dat_id, schedule);
            }
          }
        }
      }
    }

    for (const schedule of nearestSchedules.values()) {
      const targetId = schedule.person_dxe_id || schedule.teacher_id;
      if (!schedule.dat_id || !targetId) continue;

      // Ca học tốt nhất (đang diễn ra hoặc gần nhất trước đó) sẽ được đảm bảo gán đúng người
      const dat = await this.datService.getById(schedule.dat_id);
      // Đã sửa lại định dạng (format code) để khắc phục lỗi linter/prettier
      if (dat && (dat.person_dat_id !== targetId || dat.status !== 'IN_USE')) {
        try {
          // Nếu thiết bị đang được gán cho người khác (hoặc chưa được thu hồi), tiến hành thu hồi trước
          // Fix formatting: Gộp điều kiện nhiều dòng thành một dòng để cải thiện khả năng đọc
          if (dat.status !== 'AVAILABLE' && dat.person_dat_id !== targetId) {
            await this.datService.returnDat(
              schedule.dat_id,
              {
                note: `Tự động thu hồi để chuyển giao cho Giáo viên Điều xe ID ${targetId} (Lịch học ID ${schedule.id})`,
              },
              'system_cron',
            );
            this.logger.log(
              `[RETURN] Đã tự động thu hồi DAT ID ${schedule.dat_id} từ người giữ cũ để chuẩn bị giao mới.`,
            );
          }

          // Gán thiết bị cho giáo viên điều xe mới của ca học hiện tại
          await this.datService.assign(
            schedule.dat_id,
            {
              // targetId đã là kiểu number nên không cần ép kiểu
              teacher_id: targetId,
              note: `Tự động gán từ Lịch học ID ${schedule.id}`,
            },
            'system_cron',
          );
          this.logger.log(
            `[ASSIGN] Đã tự động gán DAT ID ${schedule.dat_id} cho Giáo viên Điều xe ID ${targetId}`,
          );
        } catch (error) {
          const errMsg = error instanceof Error ? error.message : String(error);
          this.logger.error(
            `Lỗi khi tự động gán DAT ID ${schedule.dat_id}: ${errMsg}`,
          );
        }
      }
    }

    // (Đã xóa Phần 2: Thu hồi DAT khi kết thúc lịch học theo yêu cầu mới)
  }
}
