import { IsNotEmpty, IsOptional, IsString, IsArray } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AccountCreateDto {
  @ApiProperty({ description: 'Tên đăng nhập', example: 'admin' })
  @IsNotEmpty({ message: 'Username không được để trống' })
  @IsString()
  username: string;

  @ApiProperty({ description: 'Mật khẩu', example: 'password123' })
  @IsNotEmpty({ message: 'Password không được để trống' })
  @IsString()
  password: string;

  // [MULTI-ROLE] Backward compat: vẫn nhận role đơn
  @ApiProperty({
    description: 'Vai trò (đơn, backward compat)',
    required: false,
  })
  @IsOptional()
  @IsString()
  role?: string;

  // [MULTI-ROLE] Mảng roles mới
  @ApiProperty({
    description: 'Danh sách vai trò',
    example: ['admin'],
    required: false,
  })
  @IsOptional()
  @IsArray()
  roles?: string[];

  @ApiProperty({ description: 'Người tạo', required: false })
  @IsOptional()
  @IsString()
  create_editor?: string;
}

export class AccountUpdateDto {
  // [MULTI-ROLE] Backward compat: vẫn nhận role đơn
  @ApiProperty({
    description: 'Vai trò (đơn, backward compat)',
    required: false,
  })
  @IsOptional()
  @IsString()
  role?: string;

  // [MULTI-ROLE] Mảng roles mới
  @ApiProperty({
    description: 'Danh sách vai trò',
    example: ['admin', 'teacher-manager'],
    required: false,
  })
  @IsOptional()
  @IsArray()
  roles?: string[];

  @ApiProperty({ description: 'Người cập nhật cuối', required: false })
  @IsOptional()
  @IsString()
  last_editor?: string;
}

export class ChangePasswordDto {
  @ApiProperty({ description: 'Mật khẩu hiện tại' })
  @IsNotEmpty({ message: 'Mật khẩu hiện tại không được để trống' })
  @IsString()
  currentPassword: string;

  @ApiProperty({ description: 'Mật khẩu mới' })
  @IsNotEmpty({ message: 'Mật khẩu mới không được để trống' })
  @IsString()
  newPassword: string;

  @ApiProperty({ description: 'Người cập nhật cuối', required: false })
  @IsOptional()
  @IsString()
  last_editor?: string;
}
