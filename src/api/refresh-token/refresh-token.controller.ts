// === RefreshToken Controller — API quản lý refresh tokens (chỉ admin) ===
import {
  Controller,
  Get,
  Delete,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
  ParseIntPipe,
  DefaultValuePipe,
  NotFoundException,
} from '@nestjs/common';
import { RefreshTokenManagementService } from './refresh-token.service';
import { AuthGuard } from '@nestjs/passport';
import { ResponseMessage } from '../../common/decorators/response-message.decorator';
import { ApiTags, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
// [SECURITY] Import RBAC - Chỉ admin mới được quản lý refresh tokens
import { Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';

@ApiTags('RefreshTokens')
@ApiBearerAuth()
@Controller('api/RefreshTokens')
// [SECURITY] Yêu cầu đăng nhập + chỉ admin
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Roles('admin')
export class RefreshTokenController {
  constructor(
    private readonly refreshTokenService: RefreshTokenManagementService,
  ) {}

  // Lấy danh sách tất cả refresh tokens
  @Get()
  @ApiQuery({ name: 'pageNumber', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'pageSize', required: false, type: Number, example: 10 })
  @ResponseMessage('Lấy danh sách refresh tokens thành công')
  async getAll(
    @Query('pageNumber', new DefaultValuePipe(1), ParseIntPipe)
    pageNumber: number,
    @Query('pageSize', new DefaultValuePipe(10), ParseIntPipe)
    pageSize: number,
  ) {
    const result = await this.refreshTokenService.getAll(pageNumber, pageSize);
    const totalPages = Math.ceil(result.TotalCount / pageSize);

    return {
      items: result.Items,
      totalCount: result.TotalCount,
      pageNumber,
      pageSize,
      totalPages,
    };
  }

  // Xóa (thu hồi) refresh token
  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ResponseMessage('Xóa refresh token thành công')
  async delete(@Param('id', ParseIntPipe) id: number) {
    const deleted = await this.refreshTokenService.delete(id);
    if (!deleted) {
      throw new NotFoundException('Không tìm thấy refresh token');
    }
    return null;
  }
}
