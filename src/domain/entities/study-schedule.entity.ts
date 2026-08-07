import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type StudyScheduleDocument = StudySchedule & Document;

@Schema({
  timestamps: { createdAt: 'create_update', updatedAt: 'last_update' },
})
export class StudySchedule {
  @Prop({ unique: true })
  id: number;

  @Prop()
  student_id?: number;

  @Prop()
  teacher_id?: number;

  @Prop()
  dat_id?: number;

  @Prop()
  date_register?: Date;

  @Prop()
  start_time?: Date;

  @Prop()
  end_time?: Date;

  @Prop()
  type?: number;

  @Prop()
  shift?: string;

  @Prop()
  status?: string;

  @Prop()
  person_dxe_id?: number;

  @Prop()
  create_editor?: string;

  @Prop()
  last_editor?: string;

  @Prop()
  create_update?: Date;

  @Prop()
  last_update?: Date;
}

export const StudyScheduleSchema = SchemaFactory.createForClass(StudySchedule);
