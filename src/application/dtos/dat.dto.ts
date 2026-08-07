import { IsNotEmpty, IsOptional, IsString, IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class DatCreateDto {
  @ApiProperty({ description: 'Mã thiết bị DAT' })
  @IsNotEmpty()
  @IsString()
  device_code: string;

  @ApiProperty({ description: 'Biển số xe' })
  @IsNotEmpty()
  @IsString()
  license_plate: string;

  @ApiProperty({ description: 'Hạng GPLX', required: false })
  @IsOptional()
  @IsString()
  license_class?: string;

  @ApiProperty({ description: 'ID người quản lý thiết bị', required: false })
  @IsOptional()
  @IsNumber()
  person_dat_id?: number;
}

export class DatUpdateDto extends DatCreateDto {}

export class DatAssignDto {
  @ApiProperty({ description: 'ID Giáo viên' })
  @IsNotEmpty()
  @IsNumber()
  teacher_id: number;

  @ApiProperty({ description: 'Ghi chú', required: false })
  @IsOptional()
  @IsString()
  note?: string;
}

export class DatReturnDto {
  @ApiProperty({ description: 'Ghi chú', required: false })
  @IsOptional()
  @IsString()
  note?: string;
}

export class DatMaintenanceDto {
  @ApiProperty({ description: 'Ghi chú bảo hành', required: false })
  @IsOptional()
  @IsString()
  note?: string;
}
