import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AuditLog, AuditLogDocument } from '../../domain/entities';

@Injectable()
export class AuditLogService {
  private readonly logger = new Logger(AuditLogService.name);

  constructor(
    @InjectModel(AuditLog.name)
    private auditLogModel: Model<AuditLogDocument>,
  ) {}

  // Lấy danh sách log có phân trang và lọc
  async getLogs(query: {
    page?: number;
    limit?: number;
    tableName?: string;
    action?: string;
  }) {
    try {
      const page = query.page || 1;
      const limit = query.limit || 20;
      const skip = (page - 1) * limit;

      const filter: any = {};
      if (query.tableName) {
        filter.tableName = { $regex: query.tableName, $options: 'i' };
      }
      if (query.action) {
        filter.action = query.action;
      }

      // Chỉ lấy dữ liệu 5 ngày gần nhất
      const fiveDaysAgo = new Date();
      fiveDaysAgo.setDate(fiveDaysAgo.getDate() - 5);
      filter.timestamp = { $gte: fiveDaysAgo };

      const [items, total] = await Promise.all([
        this.auditLogModel
          .find(filter)
          .sort({ timestamp: -1 })
          .skip(skip)
          .limit(limit)
          .exec(),
        this.auditLogModel.countDocuments(filter).exec(),
      ]);

      return {
        items,
        totalCount: total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      };
    } catch (error) {
      this.logger.error('Lỗi khi lấy danh sách audit log:', error);
      throw error;
    }
  }

  // Phương thức dùng cho Interceptor/Middleware gọi để ghi log
  async logAction(data: {
    tableName: string;
    action: string;
    oldValues?: any;
    newValues?: any;
    executedByUserId?: string;
    ipAddress?: string;
    userAgent?: string;
  }) {
    try {
      const log = new this.auditLogModel(data);
      await log.save();
    } catch (error) {
      this.logger.error('Lỗi khi ghi audit log:', error);
      // Không ném lỗi ra ngoài để tránh làm sập request chính
    }
  }
}
