// === DTO cho module Role - Validate dữ liệu đầu vào ===
import { IsNotEmpty, IsOptional, IsString, IsBoolean, IsArray } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

// DTO tạo mới Role
export class RoleCreateDto {
  @ApiProperty({ description: 'Tên role (unique key)', example: 'manager' })
  @IsNotEmpty({ message: 'Tên role không được để trống' })
  @IsString()
  name: string;

  @ApiProperty({ description: 'Tên hiển thị', example: 'Quản lý' })
  @IsNotEmpty({ message: 'Tên hiển thị không được để trống' })
  @IsString()
  label: string;

  @ApiProperty({ description: 'Mô tả vai trò', required: false, example: 'Vai trò quản lý chung' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: 'Đánh dấu role hệ thống', required: false, default: false })
  @IsOptional()
  @IsBoolean()
  is_system?: boolean;

  // [DYNAMIC PERMISSIONS] Mảng menu key mà role được phép truy cập
  @ApiProperty({
    description: 'Danh sách menu key được phép truy cập',
    required: false,
    example: ['dashboard', 'accounts', 'courses'],
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  permissions?: string[];

  // [DYNAMIC PERMISSIONS] Loại layout sử dụng
  @ApiProperty({ description: 'Loại layout (main hoặc admin)', required: false, default: 'admin' })
  @IsOptional()
  @IsString()
  layout?: string;

  // [DYNAMIC PERMISSIONS] Prefix URL cho role
  @ApiProperty({ description: 'Prefix URL cho role', required: false, example: '/admin' })
  @IsOptional()
  @IsString()
  base_path?: string;
}

// DTO cập nhật Role (tất cả trường đều optional)
export class RoleUpdateDto {
  @ApiProperty({ description: 'Tên role (unique key)', required: false })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({ description: 'Tên hiển thị', required: false })
  @IsOptional()
  @IsString()
  label?: string;

  @ApiProperty({ description: 'Mô tả vai trò', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: 'Đánh dấu role hệ thống', required: false })
  @IsOptional()
  @IsBoolean()
  is_system?: boolean;

  // [DYNAMIC PERMISSIONS] Mảng menu key mà role được phép truy cập
  @ApiProperty({
    description: 'Danh sách menu key được phép truy cập',
    required: false,
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  permissions?: string[];

  // [DYNAMIC PERMISSIONS] Loại layout sử dụng
  @ApiProperty({ description: 'Loại layout (main hoặc admin)', required: false })
  @IsOptional()
  @IsString()
  layout?: string;

  // [DYNAMIC PERMISSIONS] Prefix URL cho role
  @ApiProperty({ description: 'Prefix URL cho role', required: false })
  @IsOptional()
  @IsString()
  base_path?: string;
}
