import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type CourseDocument = Course & Document;

@Schema({
  timestamps: { createdAt: 'create_update', updatedAt: 'last_update' },
})
export class Course {
  @Prop({ unique: true })
  id: number;

  @Prop()
  course_name?: string;

  @Prop()
  license_class?: string;

  @Prop()
  course_code?: string;

  @Prop()
  start_time?: Date;

  @Prop()
  end_time?: Date;

  @Prop()
  create_editor?: string;

  @Prop()
  last_editor?: string;

  @Prop()
  create_update?: Date;

  @Prop()
  last_update?: Date;
}

export const CourseSchema = SchemaFactory.createForClass(Course);
