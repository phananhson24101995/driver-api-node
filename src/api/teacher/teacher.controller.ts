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
import { TeacherService } from './teacher.service';
import {
  TeacherCreateDto,
  TeacherUpdateDto,
} from '../../application/dtos/teacher.dto';
import { AuthGuard } from '@nestjs/passport';
import { ResponseMessage } from '../../common/decorators/response-message.decorator';
import { ApiTags, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';

@ApiTags('Teacher')
@ApiBearerAuth()
@Controller('api/Teacher') // match api/Teacher
export class TeacherController {
  constructor(private readonly teacherService: TeacherService) {}

  @Get()
  @ApiQuery({ name: 'pageNumber', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'pageSize', required: false, type: Number, example: 10 })
  @ApiQuery({ name: 'keyword', required: false, type: String })
  @ResponseMessage('Lấy danh sách giáo viên thành công')
  async getAll(
    // Đã sửa lại định dạng (xuống dòng) để tuân thủ quy tắc Prettier
    @Query('pageNumber', new DefaultValuePipe(1), ParseIntPipe)
    pageNumber: number,
    @Query('pageSize', new DefaultValuePipe(10), ParseIntPipe) pageSize: number,
    @Query('keyword') keyword?: string,
  ) {
    const result = await this.teacherService.getAll(
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
  @ResponseMessage('Lấy giáo viên thành công')
  async getById(@Param('id', ParseIntPipe) id: number) {
    const teacher = await this.teacherService.getById(id);
    if (!teacher) {
      throw new NotFoundException('Không tìm thấy giáo viên');
    }
    return teacher;
  }

  @Post()
  @UseGuards(AuthGuard('jwt'))
  @HttpCode(HttpStatus.OK)
  @ResponseMessage('Tạo giáo viên thành công')
  async create(@Body() dto: TeacherCreateDto) {
    return this.teacherService.create(dto);
  }

  @Put(':id')
  @UseGuards(AuthGuard('jwt'))
  @HttpCode(HttpStatus.OK)
  @ResponseMessage('Cập nhật giáo viên thành công')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: TeacherUpdateDto,
  ) {
    const result = await this.teacherService.update(id, dto);
    if (!result) {
      throw new NotFoundException('Không tìm thấy giáo viên');
    }
    return result;
  }

  @Delete(':id')
  @UseGuards(AuthGuard('jwt'))
  @HttpCode(HttpStatus.OK)
  @ResponseMessage('Xóa giáo viên thành công')
  async delete(@Param('id', ParseIntPipe) id: number) {
    const deleted = await this.teacherService.delete(id);
    if (!deleted) {
      throw new NotFoundException('Không tìm thấy giáo viên');
    }
    return null;
  }
}
