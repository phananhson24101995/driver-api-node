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
import { CourseService } from './course.service';
import {
  CourseCreateDto,
  CourseUpdateDto,
} from '../../application/dtos/course.dto';
import { AuthGuard } from '@nestjs/passport';
import { ResponseMessage } from '../../common/decorators/response-message.decorator';
import { ApiTags, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';

@ApiTags('Courses')
@ApiBearerAuth()
@Controller('api/Courses')
export class CourseController {
  constructor(private readonly courseService: CourseService) {}

  @Get()
  @ApiQuery({ name: 'pageNumber', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'pageSize', required: false, type: Number, example: 10 })
  @ApiQuery({ name: 'keyword', required: false, type: String })
  @ResponseMessage('Lấy danh sách khóa học thành công')
  async getAll(
    @Query('pageNumber', new DefaultValuePipe(1), ParseIntPipe)
    pageNumber: number,
    @Query('pageSize', new DefaultValuePipe(10), ParseIntPipe) pageSize: number,
    @Query('keyword') keyword?: string,
  ) {
    const result = await this.courseService.getAll(
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
  @ResponseMessage('Lấy khóa học thành công')
  async getById(@Param('id', ParseIntPipe) id: number) {
    const item = await this.courseService.getById(id);
    if (!item) {
      throw new NotFoundException('Không tìm thấy khóa học');
    }
    return item;
  }

  @Post()
  @UseGuards(AuthGuard('jwt'))
  @HttpCode(HttpStatus.OK)
  @ResponseMessage('Tạo khóa học thành công')
  async create(@Body() dto: CourseCreateDto) {
    return this.courseService.create(dto);
  }

  @Put(':id')
  @UseGuards(AuthGuard('jwt'))
  @HttpCode(HttpStatus.OK)
  @ResponseMessage('Cập nhật khóa học thành công')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: CourseUpdateDto,
  ) {
    const result = await this.courseService.update(id, dto);
    if (!result) {
      throw new NotFoundException('Không tìm thấy khóa học');
    }
    return result;
  }

  @Delete(':id')
  @UseGuards(AuthGuard('jwt'))
  @HttpCode(HttpStatus.OK)
  @ResponseMessage('Xóa khóa học thành công')
  async delete(@Param('id', ParseIntPipe) id: number) {
    const deleted = await this.courseService.delete(id);
    if (!deleted) {
      throw new NotFoundException('Không tìm thấy khóa học');
    }
    return null;
  }
}
