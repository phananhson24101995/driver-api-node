import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  StudySchedule,
  StudyScheduleDocument,
} from '../../domain/entities/study-schedule.entity';
import {
  StudyScheduleCreateDto,
  StudyScheduleUpdateDto,
} from '../../application/dtos/study-schedule.dto';
import { DatService } from '../dat/dat.service';

@Injectable()
export class StudyScheduleService {
  constructor(
    @InjectModel(StudySchedule.name)
    private studyScheduleModel: Model<StudyScheduleDocument>,
    private datService: DatService,
  ) {}

  async getAll(
    pageNumber: number = 1,
    pageSize: number = 10,
    keyword?: string,
    dateRegister?: string,
  ) {
    const filter: Record<string, any> = {};
    if (keyword) {
      const lowerKeyword = keyword.toLowerCase();
      filter.$or = [
        { shift: { $regex: lowerKeyword, $options: 'i' } },
        { status: { $regex: lowerKeyword, $options: 'i' } },
      ];
    }

    if (dateRegister) {
      const date = new Date(dateRegister);
      if (!isNaN(date.getTime())) {
        const startOfDay = new Date(
          date.getFullYear(),
          date.getMonth(),
          date.getDate(),
        );
        const endOfDay = new Date(
          date.getFullYear(),
          date.getMonth(),
          date.getDate(),
          23,
          59,
          59,
          999,
        );
        filter.date_register = { $gte: startOfDay, $lte: endOfDay };
      }
    }

    const totalCount = await this.studyScheduleModel.countDocuments(filter);
    const items = await this.studyScheduleModel
      .find(filter)
      .skip((pageNumber - 1) * pageSize)
      .limit(pageSize)
      .exec();

    return {
      Items: items.map((item) => item.toObject()),
      TotalCount: totalCount,
    };
  }

  async getById(id: number) {
    const item = await this.studyScheduleModel.findOne({ id }).exec();
    if (!item) return null;
    return item.toObject();
  }

  async create(dto: StudyScheduleCreateDto) {
    const item = new this.studyScheduleModel(dto);
    await item.save();

    await this.tryAssignDatImmediate(item);

    return item.toObject();
  }

  async update(id: number, dto: StudyScheduleUpdateDto) {
    const item = await this.studyScheduleModel.findOneAndUpdate({ id }, dto, {
      new: true,
    });
    if (!item) return null;

    await this.tryAssignDatImmediate(item);

    return item.toObject();
  }

  async delete(id: number) {
    const result = await this.studyScheduleModel.findOneAndDelete({ id });
    return result !== null;
  }

  // Thử gán thiết bị DAT ngay lập tức - CHỈ khi ca học ĐANG DIỄN RA
  // Không gán cho ca sắp tới hoặc đã kết thúc để tránh DAT bị gắn ngay khi đăng ký lịch
  private async tryAssignDatImmediate(schedule: StudyScheduleDocument) {
    if (!schedule.dat_id || !schedule.teacher_id) return;
    const now = new Date();

    try {
      // Tạo ngày hôm qua để lọc lịch học liên quan
      const yesterday = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate() - 1,
      );

      const relevantSchedules = await this.studyScheduleModel.find({
        dat_id: schedule.dat_id,
        date_register: { $gte: yesterday },
        teacher_id: { $exists: true, $ne: null },
        status: { $nin: ['CANCELLED', 'COMPLETED'] },
      });

      let nearestSchedule: StudyScheduleDocument | null = null;
      let bestScore = -1;
      // Hàm tính thời gian bắt đầu/kết thúc của ca học dựa trên shift
      const getShiftTimes = (s: StudyScheduleDocument) => {
        if (!s.date_register) return { start: 0, end: 0 };
        const date = new Date(s.date_register);
        let startHour = 0;
        let endHour = 0;
        if (s.shift === 'morning') {
          startHour = 6;
          endHour = 12;
        } else if (s.shift === 'afternoon') {
          startHour = 12;
          endHour = 18;
        } else if (s.shift === 'evening') {
          startHour = 18;
          endHour = 23;
        } else {
          return { start: 0, end: 0 };
        }

        // Tính thời gian bắt đầu ca học (theo giờ startHour)
        const start = new Date(
          date.getFullYear(),
          date.getMonth(),
          date.getDate(),
          startHour,
          0,
          0,
        ).getTime();
        // Tính thời gian kết thúc ca học (theo giờ endHour)
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

      for (const s of relevantSchedules) {
        const { start, end } = getShiftTimes(s);
        if (!start) continue;
        const current = now.getTime();
        let score = 1; // Đã kết thúc
        if (start <= current && current < end)
          score = 3; // Đang diễn ra
        else if (start > current) score = 2; // Sắp diễn ra

        if (score > bestScore) {
          bestScore = score;
          nearestSchedule = s;
        } else if (score === bestScore && nearestSchedule) {
          if (score === 2) {
            // So sánh thời gian bắt đầu để chọn ca sớm nhất (sắp diễn ra)
            if (getShiftTimes(s).start < getShiftTimes(nearestSchedule).start)
              nearestSchedule = s;
          } else if (score === 1) {
            // So sánh thời gian kết thúc để chọn ca muộn nhất (đã kết thúc)
            if (getShiftTimes(s).end > getShiftTimes(nearestSchedule).end)
              nearestSchedule = s;
          }
        }
      }

      if (!nearestSchedule) return;

      // [FIX] Chỉ gán DAT khi ca học ĐANG DIỄN RA (bestScore === 3)
      // Không gán nếu ca sắp tới (score=2) hoặc đã kết thúc (score=1)
      // Để cron job xử lý việc gán cho các ca sắp tới
      if (bestScore !== 3) return;

      const targetTeacherId =
        nearestSchedule.person_dxe_id || nearestSchedule.teacher_id;
      const targetScheduleId = nearestSchedule.id;

      const dat = await this.datService.getById(schedule.dat_id);

      // Kiểm tra nếu thiết bị chưa được gán cho giáo viên của ca học đang diễn ra
      if (
        dat &&
        (dat.person_dat_id !== targetTeacherId || dat.status !== 'IN_USE')
      ) {
        // Nếu DAT đang được giữ bởi người khác, tiến hành thu hồi
        if (
          dat.status !== 'AVAILABLE' &&
          dat.person_dat_id !== targetTeacherId
        ) {
          await this.datService.returnDat(
            schedule.dat_id,
            {
              note: `Thu hồi để chuyển cho Giáo viên Điều xe ID ${targetTeacherId} (Lịch học ID ${targetScheduleId})`,
            },
            'system',
          );
        }
        // Sau đó gán cho giáo viên mới (chỉ khi ca đang diễn ra)
        await this.datService.assign(
          schedule.dat_id,
          {
            teacher_id: targetTeacherId as number,
            note: `Gán ngay khi đăng ký Lịch học ID ${schedule.id} (ca đang diễn ra)`,
          },
          'system',
        );
      }
    } catch (error) {
      console.error(`Lỗi khi gán DAT ngay lập tức:`, error);
    }
  }
}
