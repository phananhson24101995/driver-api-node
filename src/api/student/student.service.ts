import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Student, StudentDocument } from '../../domain/entities/student.entity';
import {
  StudentCreateDto,
  StudentUpdateDto,
} from '../../application/dtos/student.dto';

@Injectable()
export class StudentService {
  constructor(
    @InjectModel(Student.name) private studentModel: Model<StudentDocument>,
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
        { full_name: { $regex: lowerKeyword, $options: 'i' } },
        { national_id: { $regex: lowerKeyword, $options: 'i' } },
        { phone_number: { $regex: lowerKeyword, $options: 'i' } },
        { email: { $regex: lowerKeyword, $options: 'i' } },
      ];
    }

    const totalCount = await this.studentModel.countDocuments(filter);
    const items = await this.studentModel
      .find(filter)
      .skip((pageNumber - 1) * pageSize)
      .limit(pageSize)
      .exec();

    return {
      Items: items.map((item) => item.toObject() as Student),
      TotalCount: totalCount,
    };
  }

  async getById(id: number) {
    const item = await this.studentModel.findOne({ id }).exec();
    return item ? item.toObject() : null;
  }

  async create(dto: StudentCreateDto) {
    const item = new this.studentModel(dto);
    await item.save();
    return item.toObject();
  }

  async update(id: number, dto: StudentUpdateDto) {
    const item = await this.studentModel.findOneAndUpdate({ id }, dto, {
      new: true,
    });
    return item ? item.toObject() : null;
  }

  async delete(id: number) {
    const result = await this.studentModel.findOneAndDelete({ id });
    return result !== null;
  }
}
