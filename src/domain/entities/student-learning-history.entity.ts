import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type StudentLearningHistoryDocument = StudentLearningHistory & Document;

@Schema({
  timestamps: { createdAt: 'create_update', updatedAt: 'last_update' },
  collection: 'student_learning_histories',
})
export class StudentLearningHistory {
  @Prop({ unique: true })
  id: number;

  @Prop({ required: true })
  student_id: number;

  @Prop({ required: true })
  status: string;

  @Prop()
  start_date?: Date;

  @Prop()
  end_date?: Date;

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

export const StudentLearningHistorySchema = SchemaFactory.createForClass(
  StudentLearningHistory,
);
