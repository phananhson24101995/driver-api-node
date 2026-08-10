// === DatHistory Service — Quản lý lịch sử DAT (chỉ admin) ===
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  DatHistory,
  DatHistoryDocument,
} from '../../domain/entities/dat-history.entity';

@Injectable()
export class DatHistoryManagementService {
  constructor(
    @InjectModel(DatHistory.name)
    private datHistoryModel: Model<DatHistoryDocument>,
  ) {}

  /** Lấy tất cả lịch sử DAT với phân trang */
  async getAll(pageNumber: number, pageSize: number) {
    const skip = (pageNumber - 1) * pageSize;
    const [Items, TotalCount] = await Promise.all([
      this.datHistoryModel
        .find()
        .sort({ action_date: -1 })
        .skip(skip)
        .limit(pageSize)
        .lean(),
      this.datHistoryModel.countDocuments(),
    ]);
    return { Items, TotalCount };
  }

  /** Xóa lịch sử DAT theo ID */
  async delete(id: number) {
    return this.datHistoryModel.findOneAndDelete({ id }).lean();
  }
}
