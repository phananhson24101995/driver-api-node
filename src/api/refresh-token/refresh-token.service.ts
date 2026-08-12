// === RefreshToken Service — Quản lý refresh tokens (chỉ admin) ===
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  RefreshToken,
  RefreshTokenDocument,
} from '../../domain/entities/refresh-token.entity';

@Injectable()
export class RefreshTokenManagementService {
  constructor(
    @InjectModel(RefreshToken.name)
    private refreshTokenModel: Model<RefreshTokenDocument>,
  ) {}

  /** Lấy tất cả refresh tokens với phân trang */
  async getAll(pageNumber: number, pageSize: number) {
    const skip = (pageNumber - 1) * pageSize;
    // Chỉ lấy dữ liệu 5 ngày gần nhất
    const fiveDaysAgo = new Date();
    fiveDaysAgo.setDate(fiveDaysAgo.getDate() - 5);
    const filter = { created_at: { $gte: fiveDaysAgo } };

    const [Items, TotalCount] = await Promise.all([
      this.refreshTokenModel
        .aggregate([
          { $match: filter },
          { $sort: { created_at: -1 } },
          { $skip: skip },
          { $limit: pageSize },
          {
            $lookup: {
              from: 'accounts',
              localField: 'account_id',
              foreignField: 'id',
              as: 'account',
            },
          },
          {
            $addFields: {
              username: { $arrayElemAt: ['$account.username', 0] },
            },
          },
          {
            $project: {
              account: 0,
            },
          },
        ])
        .exec(),
      this.refreshTokenModel.countDocuments(filter),
    ]);
    return { Items, TotalCount };
  }

  /** Xóa (thu hồi) refresh token theo ID */
  async delete(id: number) {
    return this.refreshTokenModel.findOneAndDelete({ id }).lean();
  }
}
