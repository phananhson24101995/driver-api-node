import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsNumber,
  IsDateString,
  IsEmail,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class TeacherCreateDto {
  @ApiProperty({ description: 'Họ và tên giáo viên' })
  @IsNotEmpty({ message: 'Họ tên không được để trống' })
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

  @ApiProperty({ description: 'Số điện thoại', required: false })
  @IsOptional()
  @IsString()
  phone_number?: string;

  @ApiProperty({ description: 'Địa chỉ', required: false })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiProperty({ description: 'Email', required: false })
  @IsOptional()
  @IsEmail({}, { message: 'Email không hợp lệ' })
  email?: string;

  @ApiProperty({ description: 'Chức vụ', required: false })
  @IsOptional()
  @IsString()
  position?: string;

  @ApiProperty({ description: 'ID Tài khoản liên kết', required: false })
  @IsOptional()
  @IsNumber()
  account_id?: number;
}

export class TeacherUpdateDto extends TeacherCreateDto {}
