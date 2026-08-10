import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Teacher, TeacherDocument } from '../../domain/entities/teacher.entity';
import { Account, AccountDocument } from '../../domain/entities/account.entity';
import {
  TeacherCreateDto,
  TeacherUpdateDto,
} from '../../application/dtos/teacher.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class TeacherService {
  constructor(
    @InjectModel(Teacher.name) private teacherModel: Model<TeacherDocument>,
    @InjectModel(Account.name) private accountModel: Model<AccountDocument>,
  ) {}

  async getAll(
    pageNumber: number = 1,
    pageSize: number = 10,
    keyword?: string,
  ) {
    const filter: Record<string, any> = keyword
      ? {
          $or: [
            { full_name: { $regex: keyword.toLowerCase(), $options: 'i' } },
            { phone_number: { $regex: keyword.toLowerCase(), $options: 'i' } },
            { email: { $regex: keyword.toLowerCase(), $options: 'i' } },
          ],
        }
      : {};

    const totalCount = await this.teacherModel.countDocuments(filter);
    const items = await this.teacherModel
      .find(filter)
      .skip((pageNumber - 1) * pageSize)
      .limit(pageSize)
      .exec();

    const itemsObject = items.map((item) => item.toObject() as Teacher);

    // Lấy danh sách account_id để query username
    const accountIds = itemsObject
      .map((item) => item.account_id)
      .filter((id) => id != null);

    if (accountIds.length > 0) {
      const accounts = await this.accountModel
        .find({ id: { $in: accountIds } })
        .exec();
      const accountMap = new Map(
        accounts.map((acc) => [acc.id, acc.toObject()]),
      );

      itemsObject.forEach((item) => {
        if (item.account_id && accountMap.has(item.account_id)) {
          (item as any).account = accountMap.get(item.account_id);
        }
      });
    }

    return {
      Items: itemsObject,
      TotalCount: totalCount,
    };
  }

  async getById(id: number) {
    const teacher = await this.teacherModel.findOne({ id }).exec();
    return teacher ? teacher.toObject() : null;
  }

  async create(dto: TeacherCreateDto) {
    // Logic CreateTeacherWithAccount
    const existingAccount = await this.accountModel.findOne({
      username: dto.phone_number,
    });
    if (existingAccount) {
      throw new BadRequestException('Tài khoản đã tồn tại với username này.');
    }

    const hashedPassword = await bcrypt.hash('12345678', 10);
    const account = new this.accountModel({
      username: dto.phone_number,
      password_hash: hashedPassword,
      role: 'teacher',
    });
    await account.save();

    const teacher = new this.teacherModel({
      ...dto,
      account_id: account.id,
    });
    await teacher.save();

    return teacher.toObject();
  }

  async update(id: number, dto: TeacherUpdateDto) {
    const teacher = await this.teacherModel.findOneAndUpdate({ id }, dto, {
      new: true,
    });
    return teacher ? teacher.toObject() : null;
  }

  async delete(id: number) {
    const result = await this.teacherModel.findOneAndDelete({ id });
    return result !== null;
  }
}
