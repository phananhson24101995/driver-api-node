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
    const [Items, TotalCount] = await Promise.all([
      this.refreshTokenModel
        .find()
        .sort({ created_at: -1 })
        .skip(skip)
        .limit(pageSize)
        .lean(),
      this.refreshTokenModel.countDocuments(),
    ]);
    return { Items, TotalCount };
  }

  /** Xóa (thu hồi) refresh token theo ID */
  async delete(id: number) {
    return this.refreshTokenModel.findOneAndDelete({ id }).lean();
  }
}
