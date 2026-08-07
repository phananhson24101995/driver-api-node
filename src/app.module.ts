import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AccountModule } from './api/account/account.module';
import { TeacherModule } from './api/teacher/teacher.module';
import { AuthModule } from './api/auth/auth.module';
import { DatabaseModule } from './database/database.module';
import { StudentModule } from './api/student/student.module';
import { CourseModule } from './api/course/course.module';
import { DatModule } from './api/dat/dat.module';
import { StudyScheduleModule } from './api/study-schedule/study-schedule.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        uri: configService.get<string>('MONGODB_URI'),
      }),
      inject: [ConfigService],
    }),
    DatabaseModule,
    AccountModule,
    TeacherModule,
    AuthModule,
    StudentModule,
    CourseModule,
    DatModule,
    StudyScheduleModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
