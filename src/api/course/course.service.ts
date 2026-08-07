import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Course, CourseDocument } from '../../domain/entities/course.entity';
import {
  CourseCreateDto,
  CourseUpdateDto,
} from '../../application/dtos/course.dto';

@Injectable()
export class CourseService {
  constructor(
    @InjectModel(Course.name) private courseModel: Model<CourseDocument>,
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
        { course_name: { $regex: lowerKeyword, $options: 'i' } },
        { course_code: { $regex: lowerKeyword, $options: 'i' } },
        { license_class: { $regex: lowerKeyword, $options: 'i' } },
      ];
    }

    const totalCount = await this.courseModel.countDocuments(filter);

    const items = await this.courseModel
      .find(filter)
      .skip((pageNumber - 1) * pageSize)
      .limit(pageSize)
      .exec();

    return {
      Items: items.map((item) => item.toObject() as Course),
      TotalCount: totalCount,
    };
  }

  async getById(id: number) {
    const item = await this.courseModel.findOne({ id }).exec();
    return item ? item.toObject() : null;
  }

  async create(dto: CourseCreateDto) {
    const item = new this.courseModel(dto);
    await item.save();
    return item.toObject();
  }

  async update(id: number, dto: CourseUpdateDto) {
    const item = await this.courseModel.findOneAndUpdate({ id }, dto, {
      new: true,
    });
    return item ? item.toObject() : null;
  }

  async delete(id: number) {
    const result = await this.courseModel.findOneAndDelete({ id });
    return result !== null;
  }
}
