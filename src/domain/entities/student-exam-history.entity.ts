import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type StudentExamHistoryDocument = StudentExamHistory & Document;

@Schema({
  timestamps: { createdAt: 'create_update', updatedAt: 'last_update' },
  collection: 'student_exam_histories',
})
export class StudentExamHistory {
  @Prop({ unique: true })
  id: number;

  @Prop({ required: true })
  student_id: number;

  @Prop({ required: true })
  exam_type: string;

  @Prop()
  exam_times?: number;

  @Prop({ required: true })
  result: string;

  @Prop()
  score?: number;

  @Prop()
  exam_date?: Date;

  @Prop()
  notes?: string;

  @Prop()
  create_editor?: string;

  @Prop()
  last_editor?: string;

  @Prop()
  create_update?: Date;

  @Prop()
  last_update?: Date;
}

export const StudentExamHistorySchema =
  SchemaFactory.createForClass(StudentExamHistory);
