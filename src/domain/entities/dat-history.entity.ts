import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type DatHistoryDocument = DatHistory & Document;

@Schema({
  timestamps: { createdAt: 'create_update', updatedAt: 'last_update' },
})
export class DatHistory {
  @Prop({ unique: true })
  id: number;

  @Prop({ required: true })
  dat_id: number;

  @Prop()
  teacher_id?: number;

  @Prop({ required: true })
  action: string; // ASSIGN, RETURN, MAINTENANCE

  @Prop()
  note?: string;

  @Prop({ default: Date.now })
  action_date?: Date;

  @Prop()
  create_editor?: string;

  @Prop()
  last_editor?: string;

  @Prop()
  create_update?: Date;

  @Prop()
  last_update?: Date;
}

export const DatHistorySchema = SchemaFactory.createForClass(DatHistory);
