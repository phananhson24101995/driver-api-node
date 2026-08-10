import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type StudentDocument = Student & Document;

@Schema({
  timestamps: { createdAt: 'create_update', updatedAt: 'last_update' },
})
export class Student {
  @Prop({ unique: true })
  id: number;

  @Prop({ required: true })
  full_name: string;

  @Prop()
  dob?: Date;

  @Prop()
  gender?: string;

  @Prop({ required: true })
  national_id: string;

  @Prop()
  id_issued_date?: Date;

  @Prop()
  id_issued_place?: string;

  @Prop()
  address?: string;

  @Prop()
  phone_number?: string;

  @Prop()
  email?: string;

  @Prop()
  ethnicity?: string;

  @Prop()
  // Không bắt buộc khi mới tạo học viên (có thể cấp tài khoản sau)
  account_id?: number;

  @Prop()
  course_id?: number;

  @Prop()
  dat_id?: number;

  @Prop()
  teacher_id?: number;

  @Prop()
  create_editor?: string;

  @Prop()
  last_editor?: string;

  @Prop()
  create_update?: Date;

  @Prop()
  last_update?: Date;
}

export const StudentSchema = SchemaFactory.createForClass(Student);
