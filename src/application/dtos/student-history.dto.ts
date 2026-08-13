import { ApiProperty, PartialType } from '@nestjs/swagger';
import {
  IsDateString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateLearningHistoryDto {
  @ApiProperty({ description: 'ID học viên' })
  @IsNotEmpty()
  @IsNumber()
  student_id: number;

  @ApiProperty({ description: 'Trạng thái học' })
  @IsNotEmpty()
  @IsString()
  status: string;

  @ApiProperty({ description: 'Thời gian bắt đầu', required: false })
  @IsOptional()
  @IsDateString()
  start_date?: Date;

  @ApiProperty({ description: 'Thời gian kết thúc', required: false })
  @IsOptional()
  @IsDateString()
  end_date?: Date;

  @ApiProperty({ description: 'Ghi chú', required: false })
  @IsOptional()
  @IsString()
  notes?: string;
}

export class UpdateLearningHistoryDto extends PartialType(
  CreateLearningHistoryDto,
) {}

export class CreateExamHistoryDto {
  @ApiProperty({ description: 'ID học viên' })
  @IsNotEmpty()
  @IsNumber()
  student_id: number;

  @ApiProperty({ description: 'Loại bài thi' })
  @IsNotEmpty()
  @IsString()
  exam_type: string;

  @ApiProperty({ description: 'Lần thi', required: false })
  @IsOptional()
  @IsNumber()
  exam_times?: number;

  @ApiProperty({ description: 'Kết quả thi' })
  @IsNotEmpty()
  @IsString()
  result: string;

  @ApiProperty({ description: 'Điểm số', required: false })
  @IsOptional()
  @IsNumber()
  score?: number;

  @ApiProperty({ description: 'Ngày thi', required: false })
  @IsOptional()
  @IsDateString()
  exam_date?: Date;

  @ApiProperty({ description: 'Ghi chú', required: false })
  @IsOptional()
  @IsString()
  notes?: string;
}

export class UpdateExamHistoryDto extends PartialType(CreateExamHistoryDto) {}
