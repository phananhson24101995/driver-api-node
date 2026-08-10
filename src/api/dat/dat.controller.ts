import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
  ParseIntPipe,
  DefaultValuePipe,
  NotFoundException,
  Req,
} from '@nestjs/common';
import { DatService } from './dat.service';
// Import các DTO của module Dat (đã format lại thành nhiều dòng)
import {
  DatCreateDto,
  DatUpdateDto,
  DatAssignDto,
  DatReturnDto,
  DatMaintenanceDto,
} from '../../application/dtos/dat.dto';
import { AuthGuard } from '@nestjs/passport';
import { ResponseMessage } from '../../common/decorators/response-message.decorator';
import { ApiTags, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
// [SECURITY] Import RBAC - Phân quyền API theo vai trò
import { Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';

@ApiTags('Dat')
@ApiBearerAuth()
@Controller('api/Dat')
export class DatController {
  constructor(private readonly datService: DatService) {}

  // [SECURITY] GET danh sách DAT - cho phép xem mà không cần phân quyền
  @Get()
  @ApiQuery({ name: 'pageNumber', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'pageSize', required: false, type: Number, example: 10 })
  @ApiQuery({ name: 'keyword', required: false, type: String })
  @ResponseMessage('Lấy danh sách DAT thành công')
  async getAll(
    @Query('pageNumber', new DefaultValuePipe(1), ParseIntPipe)
    pageNumber: number,
    @Query('pageSize', new DefaultValuePipe(10), ParseIntPipe) pageSize: number,
    @Query('keyword') keyword?: string,
  ) {
    const result = await this.datService.getAll(pageNumber, pageSize, keyword);
    const totalPages = Math.ceil(result.TotalCount / pageSize);

    return {
      items: result.Items,
      totalCount: result.TotalCount,
      pageNumber,
      pageSize,
      totalPages,
    };
  }

  // [SECURITY] GET chi tiết DAT - cho phép xem mà không cần phân quyền
  @Get(':id')
  @ResponseMessage('Lấy DAT thành công')
  async getById(@Param('id', ParseIntPipe) id: number) {
    const item = await this.datService.getById(id);
    if (!item) {
      throw new NotFoundException('Không tìm thấy DAT');
    }
    return item;
  }

  // [SECURITY] admin và admin-teacher được tạo thiết bị DAT mới
  @Post()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin', 'admin-teacher')
  @HttpCode(HttpStatus.OK)
  @ResponseMessage('Tạo DAT thành công')
  async create(@Body() dto: DatCreateDto) {
    return this.datService.create(dto);
  }

  // [SECURITY] admin, admin-teacher và teacher được cập nhật thông tin DAT (để đổi người giữ)
  @Put(':id')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin', 'admin-teacher', 'teacher')
  @HttpCode(HttpStatus.OK)
  @ResponseMessage('Cập nhật DAT thành công')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: DatUpdateDto,
  ) {
    const result = await this.datService.update(id, dto);
    if (!result) {
      throw new NotFoundException('Không tìm thấy DAT');
    }
    return result;
  }

  // [SECURITY] admin và admin-teacher được xóa thiết bị DAT
  @Delete(':id')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin', 'admin-teacher')
  @HttpCode(HttpStatus.OK)
  @ResponseMessage('Xóa DAT thành công')
  async delete(@Param('id', ParseIntPipe) id: number) {
    const deleted = await this.datService.delete(id);
    if (!deleted) {
      throw new NotFoundException('Không tìm thấy DAT');
    }
    return null;
  }

  // [SECURITY] Admin và giáo viên đều có thể giao thiết bị DAT
  @Post(':id/assign')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin', 'teacher')
  @HttpCode(HttpStatus.OK)
  @ResponseMessage('Giao thiết bị DAT thành công')
  async assign(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: DatAssignDto,
    @Req() req: { user?: { username: string } },
  ) {
    const username = req.user?.username || 'system';
    return this.datService.assign(id, dto, username);
  }

  // [SECURITY] Admin và giáo viên đều có thể thu hồi thiết bị DAT
  @Post(':id/return')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin', 'teacher')
  @HttpCode(HttpStatus.OK)
  @ResponseMessage('Thu hồi thiết bị DAT thành công')
  async returnDat(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: DatReturnDto,
    @Req() req: { user?: { username: string } },
  ) {
    const username = req.user?.username || 'system';
    return this.datService.returnDat(id, dto, username);
  }

  // [SECURITY] Admin và giáo viên đều có thể báo bảo hành thiết bị DAT
  @Post(':id/maintenance')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin', 'teacher')
  @HttpCode(HttpStatus.OK)
  @ResponseMessage('Báo bảo hành thiết bị DAT thành công')
  async maintenance(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: DatMaintenanceDto,
    @Req() req: { user?: { username: string } },
  ) {
    const username = req.user?.username || 'system';
    return this.datService.maintenance(id, dto, username);
  }

  // [SECURITY] GET lịch sử DAT - cho phép xem mà không cần phân quyền
  @Get(':id/history')
  @ResponseMessage('Lấy lịch sử thiết bị DAT thành công')
  async getHistory(@Param('id', ParseIntPipe) id: number) {
    return this.datService.getHistory(id);
  }
}
