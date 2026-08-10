import { Module } from '@nestjs/common';
import { StudyScheduleController } from './study-schedule.controller';
import { StudyScheduleService } from './study-schedule.service';
import { StudyScheduleCronService } from './study-schedule.cron.service';
import { DatModule } from '../dat/dat.module';

@Module({
  imports: [DatModule],
  controllers: [StudyScheduleController],
  providers: [StudyScheduleService, StudyScheduleCronService],
})
export class StudyScheduleModule {}
