import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsNumber,
  IsDateString,
  IsEmail,
} from 'class-validator';
import { ApiProperty, PartialType } from '@nestjs/swagger';

export class StudentCreateDto {
  @ApiProperty({ description: 'Họ và tên' })
  @IsNotEmpty()
  @IsString()
  full_name: string;

  @ApiProperty({ description: 'Ngày sinh', required: false })
  @IsOptional()
  @IsDateString()
  dob?: Date;

  @ApiProperty({ description: 'Giới tính', required: false })
  @IsOptional()
  @IsString()
  gender?: string;

  @ApiProperty({ description: 'CMND/CCCD' })
  @IsNotEmpty()
  @IsString()
  national_id: string;

  @ApiProperty({ description: 'Ngày cấp', required: false })
  @IsOptional()
  @IsDateString()
  id_issued_date?: Date;

  @ApiProperty({ description: 'Nơi cấp', required: false })
  @IsOptional()
  @IsString()
  id_issued_place?: string;

  @ApiProperty({ description: 'Địa chỉ', required: false })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiProperty({ description: 'Số điện thoại', required: false })
  @IsOptional()
  @IsString()
  phone_number?: string;

  @ApiProperty({ description: 'Email', required: false })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiProperty({ description: 'Dân tộc', required: false })
  @IsOptional()
  @IsString()
  ethnicity?: string;

  @ApiProperty({ description: 'ID Tài khoản liên kết', required: false })
  @IsOptional()
  @IsNumber()
  account_id?: number;

  @ApiProperty({ description: 'ID Khoá học', required: false })
  @IsOptional()
  @IsNumber()
  course_id?: number;

  @ApiProperty({ description: 'ID Thiết bị DAT', required: false })
  @IsOptional()
  @IsNumber()
  dat_id?: number;

  @ApiProperty({ description: 'ID Giáo viên', required: false })
  @IsOptional()
  @IsNumber()
  teacher_id?: number;
}

export class StudentUpdateDto extends PartialType(StudentCreateDto) {}
