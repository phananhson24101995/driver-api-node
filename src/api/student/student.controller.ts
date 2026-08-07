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
import { StudentService } from './student.service';
import {
  StudentCreateDto,
  StudentUpdateDto,
} from '../../application/dtos/student.dto';
import { AuthGuard } from '@nestjs/passport';
import { ResponseMessage } from '../../common/decorators/response-message.decorator';
import { ApiTags, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';

@ApiTags('Students')
@ApiBearerAuth()
@Controller('api/Students')
@UseGuards(AuthGuard('jwt'))
export class StudentController {
  constructor(private readonly studentService: StudentService) {}

  @Get()
  @ApiQuery({ name: 'pageNumber', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'pageSize', required: false, type: Number, example: 10 })
  @ApiQuery({ name: 'keyword', required: false, type: String })
  @ResponseMessage('Lấy danh sách học viên thành công')
  async getAll(
    @Query('pageNumber', new DefaultValuePipe(1), ParseIntPipe)
    pageNumber: number,
    @Query('pageSize', new DefaultValuePipe(10), ParseIntPipe) pageSize: number,
    @Query('keyword') keyword?: string,
  ) {
    const result = await this.studentService.getAll(
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
  @ResponseMessage('Lấy học viên thành công')
  async getById(@Param('id', ParseIntPipe) id: number) {
    const student = await this.studentService.getById(id);
    if (!student) {
      throw new NotFoundException('Không tìm thấy học viên');
    }
    return student;
  }

  @Post()
  @HttpCode(HttpStatus.OK)
  @ResponseMessage('Tạo học viên thành công')
  async create(@Body() dto: StudentCreateDto) {
    return this.studentService.create(dto);
  }

  @Put(':id')
  @HttpCode(HttpStatus.OK)
  @ResponseMessage('Cập nhật học viên thành công')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: StudentUpdateDto,
  ) {
    const result = await this.studentService.update(id, dto);
    if (!result) {
      throw new NotFoundException('Không tìm thấy học viên');
    }
    return result;
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ResponseMessage('Xóa học viên thành công')
  async delete(@Param('id', ParseIntPipe) id: number) {
    const deleted = await this.studentService.delete(id);
    if (!deleted) {
      throw new NotFoundException('Không tìm thấy học viên');
    }
    return null;
  }
}
