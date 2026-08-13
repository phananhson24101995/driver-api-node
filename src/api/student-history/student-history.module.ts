import { Module } from '@nestjs/common';
import { StudentHistoryController } from './student-history.controller';
import { StudentHistoryService } from './student-history.service';

@Module({
  controllers: [StudentHistoryController],
  providers: [StudentHistoryService],
})
export class StudentHistoryModule {}
