import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, HydratedDocument } from 'mongoose';

export type TeacherDocument = HydratedDocument<Teacher>;

@Schema({
  timestamps: { createdAt: 'create_update', updatedAt: 'last_update' },
})
export class Teacher {
  @Prop({ unique: true })
  id: number;

  @Prop({ required: true })
  full_name: string;

  @Prop()
  dob?: Date;

  @Prop()
  gender?: string;

  @Prop()
  phone_number?: string;

  @Prop()
  address?: string;

  @Prop()
  email?: string;

  @Prop()
  position?: string;

  @Prop()
  account_id?: number;

  @Prop()
  create_editor?: string;

  @Prop()
  last_editor?: string;

  @Prop()
  create_update?: Date;

  @Prop()
  last_update?: Date;
}

export const TeacherSchema = SchemaFactory.createForClass(Teacher);
