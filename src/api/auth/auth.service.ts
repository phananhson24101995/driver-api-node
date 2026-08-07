import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { randomBytes } from 'crypto';
import { Account, AccountDocument } from '../../domain/entities/account.entity';
import { Teacher, TeacherDocument } from '../../domain/entities/teacher.entity';
import {
  RefreshToken,
  RefreshTokenDocument,
} from '../../domain/entities/refresh-token.entity';
import { LoginDto, RegisterDto } from '../../application/dtos/auth.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(Account.name) private accountModel: Model<AccountDocument>,
    @InjectModel(Teacher.name) private teacherModel: Model<TeacherDocument>,
    @InjectModel(RefreshToken.name)
    private refreshTokenModel: Model<RefreshTokenDocument>,
    private jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    const exists = await this.accountModel.findOne({ username: dto.username });
    if (exists) {
      throw new BadRequestException('Username already exists.');
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);

    const account = new this.accountModel({
      username: dto.username,
      password_hash: hashedPassword,
      role: dto.role,
    });

    await account.save();

    const payload = {
      username: account.username,
      sub: account.id,
      role: account.role,
    };
    const accessToken = this.jwtService.sign(payload);

    // Tạo refresh token
    const refreshTokenStr = randomBytes(40).toString('hex');
    const expiry = new Date();
    expiry.setDate(expiry.getDate() + 7);

    const refreshTokenEntity = new this.refreshTokenModel({
      account_id: account.id,
      token: refreshTokenStr,
      expires_at: expiry,
    });
    await refreshTokenEntity.save();

    return {
      accessToken: accessToken,
      refreshToken: refreshTokenStr,
      username: account.username,
      role: account.role,
    };
  }

  async login(dto: LoginDto) {
    const account = await this.accountModel.findOne({ username: dto.username });
    if (!account) {
      throw new UnauthorizedException('Tên đăng nhập hoặc mật khẩu không đúng');
    }

    const isMatch = await bcrypt.compare(dto.password, account.password_hash);
    if (!isMatch) {
      throw new UnauthorizedException('Tên đăng nhập hoặc mật khẩu không đúng');
    }

    const teacher = await this.teacherModel.findOne({ account_id: account.id });

    const payload = {
      username: account.username,
      sub: account.id,
      role: account.role,
    };
    const accessToken = this.jwtService.sign(payload);

    const refreshTokenStr = randomBytes(40).toString('hex');
    const expiry = new Date();
    expiry.setDate(expiry.getDate() + 7);

    const refreshTokenEntity = new this.refreshTokenModel({
      account_id: account.id,
      token: refreshTokenStr,
      expires_at: expiry,
    });
    await refreshTokenEntity.save();

    return {
      accessToken: accessToken,
      refreshToken: refreshTokenStr,
      role: account.role,
      username: account.username,
      teacher: teacher ? teacher.toObject() : null,
    };
  }

  async refreshToken(refreshToken: string) {
    const storedToken = await this.refreshTokenModel.findOne({
      token: refreshToken,
      is_revoked: false,
      is_used: false,
      expires_at: { $gt: new Date() },
    });

    if (!storedToken) {
      throw new UnauthorizedException(
        'Refresh token không hợp lệ hoặc đã hết hạn',
      );
    }

    const account = await this.accountModel.findOne({
      id: storedToken.account_id,
    });
    if (!account) {
      throw new UnauthorizedException('Tài khoản không tồn tại');
    }

    storedToken.is_used = true;
    storedToken.is_revoked = true;
    await storedToken.save();

    const payload = {
      username: account.username,
      sub: account.id,
      role: account.role,
    };
    const newAccessToken = this.jwtService.sign(payload);

    const newRefreshTokenStr = randomBytes(40).toString('hex');
    const expiry = new Date();
    expiry.setDate(expiry.getDate() + 7);

    const newRefreshTokenEntity = new this.refreshTokenModel({
      account_id: account.id,
      token: newRefreshTokenStr,
      expires_at: expiry,
    });
    await newRefreshTokenEntity.save();

    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshTokenStr,
      username: account.username,
      role: account.role,
    };
  }

  async logout(username: string) {
    const account = await this.accountModel.findOne({ username });
    if (!account) return false;

    await this.refreshTokenModel.updateMany(
      {
        account_id: account.id,
        is_revoked: false,
        is_used: false,
        expires_at: { $gt: new Date() },
      },
      { $set: { is_revoked: true, is_used: true } },
    );
    return true;
  }

  async logoutSingleDevice(refreshToken: string) {
    const token = await this.refreshTokenModel.findOne({ token: refreshToken });
    if (!token || token.is_revoked || token.is_used) return false;

    token.is_revoked = true;
    token.is_used = true;
    await token.save();
    return true;
  }
}
