import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Account, AccountDocument } from '../../domain/entities/account.entity';
import {
  AccountCreateDto,
  AccountUpdateDto,
  ChangePasswordDto,
} from '../../application/dtos/account.dto';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class AccountService {
  constructor(
    @InjectModel(Account.name) private accountModel: Model<AccountDocument>,
  ) {}

  async getAll(
    pageNumber: number = 1,
    pageSize: number = 10,
    keyword?: string,
  ) {
    const filter: Record<string, any> = {};
    if (keyword) {
      const lowerKeyword = keyword.toLowerCase();
      filter.$or = [
        { username: { $regex: lowerKeyword, $options: 'i' } },
        // [MULTI-ROLE] Tìm trong mảng roles
        { roles: { $regex: lowerKeyword, $options: 'i' } },
      ];
    }

    const totalCount = await this.accountModel.countDocuments(filter);
    const items = await this.accountModel
      .find(filter)
      .skip((pageNumber - 1) * pageSize)
      .limit(pageSize)
      .exec();

    return {
      Items: items.map((item) => item.toObject() as Account),
      TotalCount: totalCount,
    };
  }

  async getById(id: number) {
    const account = await this.accountModel.findOne({ id }).exec();
    return account ? account.toObject() : null;
  }

  async create(dto: AccountCreateDto) {
    const existingAccount = await this.accountModel.findOne({
      username: dto.username,
    });
    if (existingAccount) {
      throw new BadRequestException('Username đã tồn tại.');
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);
    const account = new this.accountModel({
      username: dto.username,
      password_hash: hashedPassword,
      // [MULTI-ROLE] Lưu mảng roles (backward compat: nhận role đơn hoặc roles mảng)
      roles: dto.roles || (dto.role ? [dto.role] : ['teacher']),
      create_editor: dto.create_editor,
    });

    await account.save();

    return account.toObject();
  }

  async update(id: number, dto: AccountUpdateDto) {
    const account = await this.accountModel.findOne({ id });
    if (!account) return null;

    // [MULTI-ROLE] Cập nhật mảng roles (backward compat: nhận role đơn hoặc roles mảng)
    if (dto.roles) {
      account.roles = dto.roles;
      account.last_editor = dto.last_editor;
    } else if (dto.role) {
      account.roles = [dto.role];
      account.last_editor = dto.last_editor;
    }

    await account.save();

    return account.toObject();
  }

  async delete(id: number) {
    const result = await this.accountModel.findOneAndDelete({ id });
    return result !== null;
  }

  async changePassword(id: number, dto: ChangePasswordDto) {
    const account = await this.accountModel.findOne({ id });
    if (!account) return false;

    if (!account.password_hash) {
      throw new BadRequestException('Mật khẩu hiện tại không đúng.');
    }

    const isMatch = await bcrypt.compare(
      dto.currentPassword,
      account.password_hash,
    );
    if (!isMatch) {
      throw new BadRequestException('Mật khẩu hiện tại không đúng.');
    }

    account.password_hash = await bcrypt.hash(dto.newPassword, 10);
    account.last_editor = dto.last_editor;
    await account.save();

    return true;
  }
}
