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
  BadRequestException,
} from '@nestjs/common';
import { AccountService } from './account.service';
import {
  AccountCreateDto,
  AccountUpdateDto,
  ChangePasswordDto,
} from '../../application/dtos/account.dto';
import { AuthGuard } from '@nestjs/passport';
import { ResponseMessage } from '../../common/decorators/response-message.decorator';
import { ApiTags, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';

@ApiTags('Account')
@ApiBearerAuth()
@Controller('api/Account')
@UseGuards(AuthGuard('jwt'))
export class AccountController {
  constructor(private readonly accountService: AccountService) {}

  @Get()
  @ApiQuery({ name: 'pageNumber', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'pageSize', required: false, type: Number, example: 10 })
  @ApiQuery({ name: 'keyword', required: false, type: String })
  @ResponseMessage('Lấy danh sách tài khoản thành công')
  async getAll(
    @Query('pageNumber', new DefaultValuePipe(1), ParseIntPipe)
    pageNumber: number,
    @Query('pageSize', new DefaultValuePipe(10), ParseIntPipe) pageSize: number,
    @Query('keyword') keyword?: string,
  ) {
    const result = await this.accountService.getAll(
      pageNumber,
      pageSize,
      keyword,
    );
    const totalPages = Math.ceil(result.TotalCount / pageSize);

    return {
      items: result.Items,
      totalCount: result.TotalCount,
      pageNumber,
      pageSize,
      totalPages,
    };
  }

  @Get(':id')
  @ResponseMessage('Lấy tài khoản thành công')
  async getById(@Param('id', ParseIntPipe) id: number) {
    const account = await this.accountService.getById(id);
    if (!account) {
      throw new NotFoundException('Không tìm thấy tài khoản');
    }
    return account;
  }

  @Post()
  @HttpCode(HttpStatus.OK)
  @ResponseMessage('Tạo tài khoản thành công')
  async create(@Body() dto: AccountCreateDto) {
    return this.accountService.create(dto);
  }

  @Put(':id')
  @HttpCode(HttpStatus.OK)
  @ResponseMessage('Cập nhật tài khoản thành công')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: AccountUpdateDto,
  ) {
    const result = await this.accountService.update(id, dto);
    if (!result) {
      throw new NotFoundException('Không tìm thấy tài khoản');
    }
    return result;
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ResponseMessage('Xóa tài khoản thành công')
  async delete(@Param('id', ParseIntPipe) id: number) {
    const deleted = await this.accountService.delete(id);
    if (!deleted) {
      throw new NotFoundException('Không tìm thấy tài khoản');
    }
    return null;
  }

  @Put(':id/change-password')
  @HttpCode(HttpStatus.OK)
  @ResponseMessage('Đổi mật khẩu thành công')
  async changePassword(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: ChangePasswordDto,
  ) {
    const success = await this.accountService.changePassword(id, dto);
    if (!success) {
      throw new BadRequestException('Đổi mật khẩu thất bại');
    }
    return null;
  }
}
