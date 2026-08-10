// === DatHistory Module — Đăng ký module quản lý lịch sử DAT ===
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
  DatHistory,
  DatHistorySchema,
} from '../../domain/entities/dat-history.entity';
import { DatHistoryController } from './dat-history.controller';
import { DatHistoryManagementService } from './dat-history.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: DatHistory.name, schema: DatHistorySchema },
    ]),
  ],
  controllers: [DatHistoryController],
  providers: [DatHistoryManagementService],
})
export class DatHistoryManagementModule {}
