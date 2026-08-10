// === DatHistory Controller — API quản lý lịch sử DAT (chỉ admin) ===
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
import { DatHistoryManagementService } from './dat-history.service';
import { AuthGuard } from '@nestjs/passport';
import { ResponseMessage } from '../../common/decorators/response-message.decorator';
import { ApiTags, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
// [SECURITY] Import RBAC - Chỉ admin mới được quản lý lịch sử DAT
import { Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';

@ApiTags('DatHistories')
@ApiBearerAuth()
@Controller('api/DatHistories')
// [SECURITY] Yêu cầu đăng nhập + chỉ admin
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Roles('admin')
export class DatHistoryController {
  constructor(
    private readonly datHistoryService: DatHistoryManagementService,
  ) {}

  // Lấy danh sách tất cả lịch sử DAT
  @Get()
  @ApiQuery({ name: 'pageNumber', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'pageSize', required: false, type: Number, example: 10 })
  @ResponseMessage('Lấy danh sách lịch sử DAT thành công')
  async getAll(
    @Query('pageNumber', new DefaultValuePipe(1), ParseIntPipe)
    pageNumber: number,
    @Query('pageSize', new DefaultValuePipe(10), ParseIntPipe)
    pageSize: number,
  ) {
    const result = await this.datHistoryService.getAll(pageNumber, pageSize);
    const totalPages = Math.ceil(result.TotalCount / pageSize);

    return {
      items: result.Items,
      totalCount: result.TotalCount,
      pageNumber,
      pageSize,
      totalPages,
    };
  }

  // Xóa lịch sử DAT
  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ResponseMessage('Xóa lịch sử DAT thành công')
  async delete(@Param('id', ParseIntPipe) id: number) {
    const deleted = await this.datHistoryService.delete(id);
    if (!deleted) {
      throw new NotFoundException('Không tìm thấy lịch sử DAT');
    }
    return null;
  }
}
