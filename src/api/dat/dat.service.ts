import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { DAT, DATDocument } from '../../domain/entities/dat.entity';
import {
  DatCreateDto,
  DatUpdateDto,
  DatAssignDto,
  DatReturnDto,
  DatMaintenanceDto,
} from '../../application/dtos/dat.dto';
import {
  DatHistory,
  DatHistoryDocument,
} from '../../domain/entities/dat-history.entity';
import { BadRequestException } from '@nestjs/common';

@Injectable()
export class DatService {
  constructor(
    @InjectModel(DAT.name) private datModel: Model<DATDocument>,
    @InjectModel(DatHistory.name)
    private datHistoryModel: Model<DatHistoryDocument>,
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
        { device_code: { $regex: lowerKeyword, $options: 'i' } },
        { license_plate: { $regex: lowerKeyword, $options: 'i' } },
        { license_class: { $regex: lowerKeyword, $options: 'i' } },
      ];
    }

    const totalCount = await this.datModel.countDocuments(filter);
    const items = await this.datModel
      .find(filter)
      .skip((pageNumber - 1) * pageSize)
      .limit(pageSize)
      .exec();

    return {
      Items: items.map((item) => item.toObject() as DAT),
      TotalCount: totalCount,
    };
  }

  async getById(id: number) {
    const item = await this.datModel.findOne({ id }).exec();
    return item ? item.toObject() : null;
  }

  async create(dto: DatCreateDto) {
    const item = new this.datModel(dto);
    await item.save();
    return item.toObject();
  }

  async update(id: number, dto: DatUpdateDto) {
    const item = await this.datModel.findOneAndUpdate({ id }, dto, {
      new: true,
    });
    return item ? item.toObject() : null;
  }

  async delete(id: number) {
    const result = await this.datModel.findOneAndDelete({ id });
    return result !== null;
  }

  async assign(id: number, dto: DatAssignDto, username: string) {
    const dat = await this.datModel.findOne({ id });
    if (!dat) throw new BadRequestException('Không tìm thấy thiết bị DAT');
    if (dat.status !== 'AVAILABLE') {
      throw new BadRequestException('Thiết bị không ở trạng thái sẵn sàng');
    }

    dat.person_dat_id = dto.teacher_id;
    dat.status = 'IN_USE';
    await dat.save();

    const history = new this.datHistoryModel({
      dat_id: id,
      teacher_id: dto.teacher_id,
      action: 'ASSIGN',
      note: dto.note,
      create_editor: username,
    });
    await history.save();

    return dat.toObject();
  }

  async returnDat(id: number, dto: DatReturnDto, username: string) {
    const dat = await this.datModel.findOne({ id });
    if (!dat) throw new BadRequestException('Không tìm thấy thiết bị DAT');

    const previousTeacher = dat.person_dat_id;

    dat.person_dat_id = null as unknown as number;
    dat.status = 'AVAILABLE';
    await dat.save();

    const history = new this.datHistoryModel({
      dat_id: id,
      teacher_id: previousTeacher,
      action: 'RETURN',
      note: dto.note,
      create_editor: username,
    });
    await history.save();

    return dat.toObject();
  }

  async maintenance(id: number, dto: DatMaintenanceDto, username: string) {
    const dat = await this.datModel.findOne({ id });
    if (!dat) throw new BadRequestException('Không tìm thấy thiết bị DAT');

    const previousTeacher = dat.person_dat_id;

    dat.person_dat_id = null as unknown as number;
    dat.status = 'MAINTENANCE';
    await dat.save();

    const history = new this.datHistoryModel({
      dat_id: id,
      teacher_id: previousTeacher,
      action: 'MAINTENANCE',
      note: dto.note,
      create_editor: username,
    });
    await history.save();

    return dat.toObject();
  }

  async getHistory(id: number) {
    const items = await this.datHistoryModel
      .find({ dat_id: id })
      .sort({ action_date: -1 })
      .exec();
    return items.map((item) => item.toObject());
  }
}
