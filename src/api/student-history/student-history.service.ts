import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  StudentLearningHistoryDocument,
  StudentLearningHistory,
  StudentExamHistoryDocument,
  StudentExamHistory,
  StudentDocument,
  Student,
} from '../../domain/entities';
import {
  CreateLearningHistoryDto,
  UpdateLearningHistoryDto,
  CreateExamHistoryDto,
  UpdateExamHistoryDto,
} from '../../application/dtos/student-history.dto';

@Injectable()
export class StudentHistoryService {
  constructor(
    @InjectModel(StudentLearningHistory.name)
    private readonly learningHistoryModel: Model<StudentLearningHistoryDocument>,
    @InjectModel(StudentExamHistory.name)
    private readonly examHistoryModel: Model<StudentExamHistoryDocument>,
    @InjectModel(Student.name)
    private readonly studentModel: Model<StudentDocument>,
  ) {}

  // --- Cập nhật trạng thái học viên ---
  private async updateStudentLearningStatus(studentId: number) {
    const latestHistory = await this.learningHistoryModel
      .findOne({ student_id: studentId })
      .sort({ start_date: -1, create_update: -1 })
      .exec();
    const status = latestHistory ? latestHistory.status : 'PENDING_OPENING';
    await this.studentModel
      .findOneAndUpdate({ id: studentId }, { learning_status: status })
      .exec();
  }

  private async updateStudentExamStatus(studentId: number) {
    const latestHistory = await this.examHistoryModel
      .findOne({ student_id: studentId })
      .sort({ exam_date: -1, create_update: -1 })
      .exec();
    const status = latestHistory ? latestHistory.result : 'NOT_STARTED';
    await this.studentModel
      .findOneAndUpdate({ id: studentId }, { exam_status: status })
      .exec();
  }

  // --- Learning History ---
  async getLearningHistory(studentId: number) {
    return this.learningHistoryModel
      .find({ student_id: studentId })
      .sort({ start_date: -1, create_update: -1 })
      .exec();
  }

  async createLearningHistory(dto: CreateLearningHistoryDto) {
    const created = new this.learningHistoryModel(dto);
    const result = await created.save();
    await this.updateStudentLearningStatus(dto.student_id);
    return result;
  }

  async updateLearningHistory(id: number, dto: UpdateLearningHistoryDto) {
    const updated = await this.learningHistoryModel
      .findOneAndUpdate({ id }, dto, { new: true })
      .exec();
    if (updated) await this.updateStudentLearningStatus(updated.student_id);
    return updated;
  }

  async deleteLearningHistory(id: number) {
    const deleted = await this.learningHistoryModel
      .findOneAndDelete({ id })
      .exec();
    if (deleted) await this.updateStudentLearningStatus(deleted.student_id);
    return deleted;
  }

  // --- Exam History ---
  async getExamHistory(studentId: number) {
    return this.examHistoryModel
      .find({ student_id: studentId })
      .sort({ exam_date: -1, create_update: -1 })
      .exec();
  }

  async createExamHistory(dto: CreateExamHistoryDto) {
    const created = new this.examHistoryModel(dto);
    const result = await created.save();
    await this.updateStudentExamStatus(dto.student_id);
    return result;
  }

  async updateExamHistory(id: number, dto: UpdateExamHistoryDto) {
    const updated = await this.examHistoryModel
      .findOneAndUpdate({ id }, dto, { new: true })
      .exec();
    if (updated) await this.updateStudentExamStatus(updated.student_id);
    return updated;
  }

  async deleteExamHistory(id: number) {
    const deleted = await this.examHistoryModel.findOneAndDelete({ id }).exec();
    if (deleted) await this.updateStudentExamStatus(deleted.student_id);
    return deleted;
  }
}
