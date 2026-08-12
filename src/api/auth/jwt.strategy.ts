import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Account, AccountDocument } from '../../domain/entities/account.entity';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private configService: ConfigService,
    @InjectModel(Account.name) private accountModel: Model<AccountDocument>,
  ) {
    // [SECURITY] Lấy JWT_SECRET từ env, throw error nếu không tồn tại
    // Không sử dụng fallback secret để tránh lỗ hổng bảo mật trên production
    const jwtSecret = configService.get<string>('JWT_SECRET');
    if (!jwtSecret) {
      throw new Error(
        'JWT_SECRET chưa được cấu hình trong biến môi trường (.env). Hệ thống không thể khởi động.',
      );
    }

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: jwtSecret,
    });
  }

  // [MULTI-ROLE] JWT payload chứa mảng roles thay vì role đơn
  async validate(payload: { username: string; sub: number; roles: string[] }) {
    const account = await this.accountModel.findOne({
      username: payload.username,
    });
    if (!account) {
      throw new UnauthorizedException('Không tìm thấy tài khoản');
    }
    return {
      id: account.id,
      username: account.username,
      // [MULTI-ROLE] Trả về mảng roles từ DB (luôn cập nhật nhất)
      roles: account.roles || [],
    };
  }
}
