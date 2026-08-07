import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type DATDocument = DAT & Document;

@Schema({
  timestamps: { createdAt: 'create_update', updatedAt: 'last_update' },
})
export class DAT {
  @Prop({ unique: true })
  id: number;

  @Prop({ required: true })
  device_code: string;

  @Prop({ required: true })
  license_plate: string;

  @Prop()
  license_class?: string;

  @Prop()
  person_dat_id?: number;

  @Prop({ default: 'AVAILABLE' })
  status?: string;

  @Prop()
  create_editor?: string;

  @Prop()
  last_editor?: string;

  @Prop()
  create_update?: Date;

  @Prop()
  last_update?: Date;
}

export const DATSchema = SchemaFactory.createForClass(DAT);
