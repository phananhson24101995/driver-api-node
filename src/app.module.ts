import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { ScheduleModule } from '@nestjs/schedule';
// [SECURITY] Import ThrottlerModule để chống brute-force và DoS attack
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
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
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath:
        process.env.NODE_ENV === 'production'
          ? '.env.production'
          : '.env.development',
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        uri: configService.get<string>('MONGODB_URI'),
      }),
      inject: [ConfigService],
    }),

    // [SECURITY] Rate Limiting - Giới hạn 60 requests mỗi 60 giây (1 phút) cho mỗi IP
    // Ngăn chặn brute-force login, DoS attack
    ThrottlerModule.forRoot([
      {
        ttl: 60000, // 60 giây (đơn vị milliseconds)
        limit: 60, // Tối đa 60 requests
      },
    ]),

    ScheduleModule.forRoot(),
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
  providers: [
    AppService,
    // [SECURITY] Đăng ký ThrottlerGuard global - áp dụng rate limiting cho tất cả API
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
