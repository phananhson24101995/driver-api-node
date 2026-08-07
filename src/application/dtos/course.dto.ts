// Đã định dạng lại import theo chuẩn nhiều dòng
import { IsOptional, IsString, IsDateString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CourseCreateDto {
  @ApiProperty({ description: 'Tên khoá học', required: false })
  @IsOptional()
  @IsString()
  course_name?: string;

  @ApiProperty({ description: 'Hạng GPLX', required: false })
  @IsOptional()
  @IsString()
  license_class?: string;

  @ApiProperty({ description: 'Mã khoá học', required: false })
  @IsOptional()
  @IsString()
  course_code?: string;

  @ApiProperty({ description: 'Thời gian bắt đầu', required: false })
  @IsOptional()
  @IsDateString()
  start_time?: Date;

  @ApiProperty({ description: 'Thời gian kết thúc', required: false })
  @IsOptional()
  @IsDateString()
  end_time?: Date;
}

export class CourseUpdateDto extends CourseCreateDto {}
