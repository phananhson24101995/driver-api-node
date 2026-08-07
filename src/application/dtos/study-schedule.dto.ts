import { IsOptional, IsString, IsNumber, IsDateString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class StudyScheduleCreateDto {
  @ApiProperty({ description: 'ID Học viên', required: false })
  @IsOptional()
  @IsNumber()
  student_id?: number;

  @ApiProperty({ description: 'ID Giáo viên', required: false })
  @IsOptional()
  @IsNumber()
  teacher_id?: number;

  @ApiProperty({ description: 'ID Thiết bị DAT', required: false })
  @IsOptional()
  @IsNumber()
  dat_id?: number;

  @ApiProperty({ description: 'Ngày đăng ký', required: false })
  @IsOptional()
  @IsDateString()
  date_register?: Date;

  @ApiProperty({ description: 'Thời gian bắt đầu', required: false })
  @IsOptional()
  @IsDateString()
  start_time?: Date;

  @ApiProperty({ description: 'Thời gian kết thúc', required: false })
  @IsOptional()
  @IsDateString()
  end_time?: Date;

  @ApiProperty({ description: 'Loại lịch học', required: false })
  @IsOptional()
  @IsNumber()
  type?: number;

  @ApiProperty({ description: 'Ca học', required: false })
  @IsOptional()
  @IsString()
  shift?: string;

  @ApiProperty({ description: 'Trạng thái', required: false })
  @IsOptional()
  @IsString()
  status?: string;

  @ApiProperty({ description: 'ID Người phụ trách', required: false })
  @IsOptional()
  @IsNumber()
  person_dxe_id?: number;
}

export class StudyScheduleUpdateDto extends StudyScheduleCreateDto {}
