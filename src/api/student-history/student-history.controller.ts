import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import { StudentHistoryService } from './student-history.service';
import {
  CreateLearningHistoryDto,
  UpdateLearningHistoryDto,
  CreateExamHistoryDto,
  UpdateExamHistoryDto,
} from '../../application/dtos/student-history.dto';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { ResponseMessage } from '../../common/decorators/response-message.decorator';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Student History')
@ApiBearerAuth()
@Controller('api/StudentHistory')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class StudentHistoryController {
  constructor(private readonly historyService: StudentHistoryService) {}

  // --- Learning History ---
  @Get('Learning/:studentId')
  @Roles('admin', 'admin-teacher', 'teacher')
  @ResponseMessage('Lấy lịch sử học thành công')
  getLearningHistory(@Param('studentId', ParseIntPipe) studentId: number) {
    return this.historyService.getLearningHistory(studentId);
  }

  @Post('Learning')
  @Roles('admin', 'admin-teacher')
  @ResponseMessage('Tạo lịch sử học thành công')
  createLearningHistory(@Body() dto: CreateLearningHistoryDto) {
    return this.historyService.createLearningHistory(dto);
  }

  @Put('Learning/:id')
  @Roles('admin', 'admin-teacher')
  @ResponseMessage('Cập nhật lịch sử học thành công')
  updateLearningHistory(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateLearningHistoryDto,
  ) {
    return this.historyService.updateLearningHistory(id, dto);
  }

  @Delete('Learning/:id')
  @Roles('admin', 'admin-teacher')
  @ResponseMessage('Xóa lịch sử học thành công')
  deleteLearningHistory(@Param('id', ParseIntPipe) id: number) {
    return this.historyService.deleteLearningHistory(id);
  }

  // --- Exam History ---
  @Get('Exam/:studentId')
  @Roles('admin', 'admin-teacher', 'teacher')
  @ResponseMessage('Lấy lịch sử thi thành công')
  getExamHistory(@Param('studentId', ParseIntPipe) studentId: number) {
    return this.historyService.getExamHistory(studentId);
  }

  @Post('Exam')
  @Roles('admin', 'admin-teacher')
  @ResponseMessage('Tạo lịch sử thi thành công')
  createExamHistory(@Body() dto: CreateExamHistoryDto) {
    return this.historyService.createExamHistory(dto);
  }

  @Put('Exam/:id')
  @Roles('admin', 'admin-teacher')
  @ResponseMessage('Cập nhật lịch sử thi thành công')
  updateExamHistory(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateExamHistoryDto,
  ) {
    return this.historyService.updateExamHistory(id, dto);
  }

  @Delete('Exam/:id')
  @Roles('admin', 'admin-teacher')
  @ResponseMessage('Xóa lịch sử thi thành công')
  deleteExamHistory(@Param('id', ParseIntPipe) id: number) {
    return this.historyService.deleteExamHistory(id);
  }
}
