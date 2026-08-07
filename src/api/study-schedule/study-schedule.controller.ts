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
} from '@nestjs/common';
import { StudyScheduleService } from './study-schedule.service';
import {
  StudyScheduleCreateDto,
  StudyScheduleUpdateDto,
} from '../../application/dtos/study-schedule.dto';
import { AuthGuard } from '@nestjs/passport';
import { ResponseMessage } from '../../common/decorators/response-message.decorator';
import { ApiTags, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';

@ApiTags('StudySchedules')
@ApiBearerAuth()
@Controller('api/StudySchedules')
export class StudyScheduleController {
  constructor(private readonly studyScheduleService: StudyScheduleService) {}

  @Get()
  @ApiQuery({ name: 'pageNumber', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'pageSize', required: false, type: Number, example: 10 })
  @ApiQuery({ name: 'keyword', required: false, type: String })
  @ResponseMessage('Lấy danh sách lịch học thành công')
  async getAll(
    @Query('pageNumber', new DefaultValuePipe(1), ParseIntPipe)
    pageNumber: number,
    @Query('pageSize', new DefaultValuePipe(10), ParseIntPipe) pageSize: number,
    @Query('keyword') keyword?: string,
  ) {
    const result = await this.studyScheduleService.getAll(
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

  @Get('full-calendar')
  @ResponseMessage('Lấy lịch học full-calendar thành công')
  async getFullCalendar(
    @Query('pageNumber', new DefaultValuePipe(1), ParseIntPipe)
    pageNumber: number,
    @Query('pageSize', new DefaultValuePipe(10), ParseIntPipe) pageSize: number,
    @Query('keyword') keyword?: string,
  ) {
    const result = await this.studyScheduleService.getAll(
      pageNumber,
      pageSize,
      keyword,
    );
    return result.Items;
  }

  @Get(':id')
  @ResponseMessage('Lấy lịch học thành công')
  async getById(@Param('id', ParseIntPipe) id: number) {
    const item = await this.studyScheduleService.getById(id);
    if (!item) {
      throw new NotFoundException('Không tìm thấy lịch học');
    }
    return item;
  }

  @Post()
  @UseGuards(AuthGuard('jwt'))
  @HttpCode(HttpStatus.OK)
  @ResponseMessage('Tạo lịch học thành công')
  async create(@Body() dto: StudyScheduleCreateDto) {
    return this.studyScheduleService.create(dto);
  }

  @Put('update-schedule/:id')
  @UseGuards(AuthGuard('jwt'))
  @HttpCode(HttpStatus.OK)
  @ResponseMessage('Cập nhật lịch học thành công')
  async updateSchedule(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: StudyScheduleUpdateDto,
  ) {
    const result = await this.studyScheduleService.update(id, dto);
    if (!result) {
      throw new NotFoundException('Không tìm thấy lịch học');
    }
    return result;
  }

  @Put(':id')
  @UseGuards(AuthGuard('jwt'))
  @HttpCode(HttpStatus.OK)
  @ResponseMessage('Cập nhật lịch học thành công')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: StudyScheduleUpdateDto,
  ) {
    const result = await this.studyScheduleService.update(id, dto);
    if (!result) {
      throw new NotFoundException('Không tìm thấy lịch học');
    }
    return result;
  }

  @Delete(':id')
  @UseGuards(AuthGuard('jwt'))
  @HttpCode(HttpStatus.OK)
  @ResponseMessage('Xóa lịch học thành công')
  async delete(@Param('id', ParseIntPipe) id: number) {
    const deleted = await this.studyScheduleService.delete(id);
    if (!deleted) {
      throw new NotFoundException('Không tìm thấy lịch học');
    }
    return null;
  }
}
