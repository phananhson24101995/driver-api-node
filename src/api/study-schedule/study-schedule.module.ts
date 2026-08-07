import { Module } from '@nestjs/common';
import { StudyScheduleController } from './study-schedule.controller';
import { StudyScheduleService } from './study-schedule.service';

@Module({
  controllers: [StudyScheduleController],
  providers: [StudyScheduleService],
})
export class StudyScheduleModule {}
