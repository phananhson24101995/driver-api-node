import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type AuditLogDocument = AuditLog & Document;

@Schema({
  timestamps: { createdAt: 'timestamp', updatedAt: false }, // Audit log chỉ được ghi, không sửa
})
export class AuditLog {
  @Prop({ unique: true })
  id: number;

  @Prop({ required: true })
  tableName: string; // Tên bảng hoặc module bị thay đổi (vd: Student, Course)

  @Prop({ required: true })
  action: string; // Hành động: INSERT, UPDATE, DELETE, LOGIN...

  @Prop({ type: Object })
  oldValues?: Record<string, any>; // Giá trị cũ trước khi thay đổi (JSON)

  @Prop({ type: Object })
  newValues?: Record<string, any>; // Giá trị mới sau khi thay đổi (JSON)

  @Prop()
  executedByUserId?: string; // ID của user thực hiện thao tác

  @Prop()
  ipAddress?: string; // Địa chỉ IP người dùng

  @Prop()
  userAgent?: string; // Thông tin thiết bị/trình duyệt

  @Prop({ expires: '5d' })
  timestamp?: Date; // Ngày giờ thực hiện
}

export const AuditLogSchema = SchemaFactory.createForClass(AuditLog);
