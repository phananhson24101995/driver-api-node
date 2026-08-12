import { Module, Global } from '@nestjs/common';
import { MongooseModule, getConnectionToken } from '@nestjs/mongoose';
import { Connection, Schema } from 'mongoose';
import { AutoIncrementPlugin } from './auto-increment.plugin';

import {
  Account,
  AccountSchema,
  Teacher,
  TeacherSchema,
  Student,
  StudentSchema,
  Course,
  CourseSchema,
  DAT,
  DATSchema,
  StudySchedule,
  StudyScheduleSchema,
  RefreshToken,
  RefreshTokenSchema,
  DatHistory,
  DatHistorySchema,
  // [ROLE MANAGEMENT] Import Role entity
  Role,
  RoleSchema,
  AuditLog,
  AuditLogSchema,
} from '../domain/entities';

const createAutoIncrementFeature = (name: string, schema: Schema) => ({
  name,
  useFactory: (connection: Connection) => {
    AutoIncrementPlugin(
      schema,
      {
        inc_field: 'id',
        id: `${name}_id_counter`,
      },
      connection,
    );
    return schema;
  },
  inject: [getConnectionToken()],
});

const features = MongooseModule.forFeatureAsync([
  createAutoIncrementFeature(Account.name, AccountSchema),
  createAutoIncrementFeature(Teacher.name, TeacherSchema),
  createAutoIncrementFeature(Student.name, StudentSchema),
  createAutoIncrementFeature(Course.name, CourseSchema),
  createAutoIncrementFeature(DAT.name, DATSchema),
  createAutoIncrementFeature(StudySchedule.name, StudyScheduleSchema),
  createAutoIncrementFeature(RefreshToken.name, RefreshTokenSchema),
  createAutoIncrementFeature(DatHistory.name, DatHistorySchema),
  // [ROLE MANAGEMENT] Đăng ký Role entity với auto-increment
  createAutoIncrementFeature(Role.name, RoleSchema),
  createAutoIncrementFeature(AuditLog.name, AuditLogSchema),
]);

@Global()
@Module({
  imports: [features],
  exports: [features],
})
export class DatabaseModule {}
