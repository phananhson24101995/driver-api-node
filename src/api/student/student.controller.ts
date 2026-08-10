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
// [SECURITY] Import RBAC - Phân quyền API theo vai trò
import { Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';

@ApiTags('Students')
@ApiBearerAuth()
@Controller('api/Students')
// [SECURITY] Yêu cầu đăng nhập + kiểm tra quyền cho toàn bộ controller
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class StudentController {
  constructor(private readonly studentService: StudentService) {}

  // [SECURITY] Xem danh sách - admin và teacher đều được phép
  @Get()
  @Roles('admin', 'teacher')
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

  // [SECURITY] Xem chi tiết - admin và teacher đều được phép
  @Get(':id')
  @Roles('admin', 'teacher')
  @ResponseMessage('Lấy học viên thành công')
  async getById(@Param('id', ParseIntPipe) id: number) {
    const student = await this.studentService.getById(id);
    if (!student) {
      throw new NotFoundException('Không tìm thấy học viên');
    }
    return student;
  }

  // [SECURITY] Tạo học viên - chỉ admin
  @Post()
  @Roles('admin')
  @HttpCode(HttpStatus.OK)
  @ResponseMessage('Tạo học viên thành công')
  async create(@Body() dto: StudentCreateDto) {
    return this.studentService.create(dto);
  }

  // [SECURITY] Cập nhật học viên - chỉ admin
  @Put(':id')
  @Roles('admin')
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

  // [SECURITY] Xóa học viên - chỉ admin
  @Delete(':id')
  @Roles('admin')
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
