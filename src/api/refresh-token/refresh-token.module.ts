// === RefreshToken Module — Đăng ký module quản lý refresh tokens ===
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
  RefreshToken,
  RefreshTokenSchema,
} from '../../domain/entities/refresh-token.entity';
import { RefreshTokenController } from './refresh-token.controller';
import { RefreshTokenManagementService } from './refresh-token.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: RefreshToken.name, schema: RefreshTokenSchema },
    ]),
  ],
  controllers: [RefreshTokenController],
  providers: [RefreshTokenManagementService],
})
export class RefreshTokenManagementModule {}
