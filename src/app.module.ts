import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { ScheduleModule } from '@nestjs/schedule';
// [SECURITY] Import ThrottlerModule để chống brute-force và DoS attack
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';
import { AccountModule } from './api/account/account.module';
import { TeacherModule } from './api/teacher/teacher.module';
import { AuthModule } from './api/auth/auth.module';
import { DatabaseModule } from './database/database.module';
import { StudentModule } from './api/student/student.module';
import { CourseModule } from './api/course/course.module';
import { DatModule } from './api/dat/dat.module';
import { StudyScheduleModule } from './api/study-schedule/study-schedule.module';
import { RefreshTokenManagementModule } from './api/refresh-token/refresh-token.module';
import { DatHistoryManagementModule } from './api/dat-history/dat-history.module';
// [ROLE MANAGEMENT] Import RoleModule
import { RoleModule } from './api/role/role.module';
import { AuditLogModule } from './api/audit-log/audit-log.module';
import { StudentHistoryModule } from './api/student-history/student-history.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      // [FIX] Load env file based on NODE_ENV, với fallback sang .env nếu file đặc thù không tồn tại
      envFilePath: [
        process.env.NODE_ENV
          ? `.env.${process.env.NODE_ENV}`
          : '.env.development',
        '.env',
      ],
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
    RefreshTokenManagementModule,
    DatHistoryManagementModule,
    // [ROLE MANAGEMENT] Đăng ký RoleModule
    RoleModule,
    AuditLogModule,
    StudentHistoryModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    // [SECURITY] Đăng ký ThrottlerGuard global - áp dụng rate limiting cho tất cả API
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: LoggingInterceptor,
    },
  ],
})
export class AppModule {}
