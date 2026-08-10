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

  async validate(payload: { username: string; sub: number; role: string }) {
    const account = await this.accountModel.findOne({
      username: payload.username,
    });
    if (!account) {
      throw new UnauthorizedException('Không tìm thấy tài khoản');
    }
    return {
      id: account.id,
      username: account.username,
      role: account.role,
    };
  }
}
