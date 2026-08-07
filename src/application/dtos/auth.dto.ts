import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({ description: 'Tên đăng nhập', example: 'admin' })
  @IsNotEmpty({ message: 'Username không được để trống' })
  @IsString()
  username: string;

  @ApiProperty({ description: 'Mật khẩu', example: 'password123' })
  @IsNotEmpty({ message: 'Password không được để trống' })
  @IsString()
  password: string;
}

export class RegisterDto {
  @ApiProperty({ description: 'Tên đăng nhập', example: 'newuser' })
  @IsNotEmpty({ message: 'Username không được để trống' })
  @IsString()
  username: string;

  @ApiProperty({ description: 'Mật khẩu', example: 'password123' })
  @IsNotEmpty({ message: 'Password không được để trống' })
  @IsString()
  password: string;

  @ApiProperty({ description: 'Vai trò người dùng', example: 'student' })
  @IsNotEmpty({ message: 'Role không được để trống' })
  @IsString()
  role: string;
}

export class RefreshTokenRequestDto {
  @ApiProperty({ description: 'Refresh token để cấp lại access token' })
  @IsNotEmpty({ message: 'Refresh token không được để trống' })
  @IsString()
  refreshToken: string;
}
