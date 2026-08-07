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

@Injectable()
export class StudyScheduleService {
  constructor(
    @InjectModel(StudySchedule.name)
    private studyScheduleModel: Model<StudyScheduleDocument>,
  ) {}

  async getAll(
    pageNumber: number = 1,
    pageSize: number = 10,
    keyword?: string,
  ) {
    const filter: Record<string, any> = {};
    if (keyword) {
      const lowerKeyword = keyword.toLowerCase();
      filter.$or = [
        { shift: { $regex: lowerKeyword, $options: 'i' } },
        { status: { $regex: lowerKeyword, $options: 'i' } },
      ];
    }

    const totalCount = await this.studyScheduleModel.countDocuments(filter);
    const items = await this.studyScheduleModel
      .find(filter)
      .skip((pageNumber - 1) * pageSize)
      .limit(pageSize)
      .exec();

    return {
      Items: items.map((item) => {
        const obj = item.toObject() as any;
        return {
          ...obj,
          dateRegister: obj.date_register,
          datId: obj.dat_id,
          teacherId: obj.teacher_id,
        };
      }),
      TotalCount: totalCount,
    };
  }

  async getById(id: number) {
    const item = await this.studyScheduleModel.findOne({ id }).exec();
    if (!item) return null;
    const obj = item.toObject() as any;
    return {
      ...obj,
      dateRegister: obj.date_register,
      datId: obj.dat_id,
      teacherId: obj.teacher_id,
    };
  }

  async create(dto: StudyScheduleCreateDto) {
    const item = new this.studyScheduleModel(dto);
    await item.save();
    const obj = item.toObject() as any;
    return {
      ...obj,
      dateRegister: obj.date_register,
      datId: obj.dat_id,
      teacherId: obj.teacher_id,
    };
  }

  async update(id: number, dto: StudyScheduleUpdateDto) {
    const item = await this.studyScheduleModel.findOneAndUpdate({ id }, dto, {
      new: true,
    });
    if (!item) return null;
    const obj = item.toObject() as any;
    return {
      ...obj,
      dateRegister: obj.date_register,
      datId: obj.dat_id,
      teacherId: obj.teacher_id,
    };
  }

  async delete(id: number) {
    const result = await this.studyScheduleModel.findOneAndDelete({ id });
    return result !== null;
  }
}
