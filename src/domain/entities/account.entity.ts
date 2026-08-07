import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type AccountDocument = Account & Document;

@Schema({
  timestamps: { createdAt: 'create_update', updatedAt: 'last_update' },
  toJSON: {
    transform: (doc, ret: Record<string, any>) => {
      delete ret.password_hash;
      return ret;
    },
  },
  toObject: {
    transform: (doc, ret: Record<string, any>) => {
      delete ret.password_hash;
      return ret;
    },
  },
})
export class Account {
  @Prop({ unique: true })
  id: number;

  @Prop({ required: true, unique: true })
  username: string;

  @Prop({ required: true })
  password_hash: string;

  @Prop({ required: true })
  role: string;

  @Prop({ default: null })
  refresh_token?: string;

  @Prop({ default: null })
  refresh_token_expiry?: Date;

  @Prop({ default: null })
  create_editor?: string;

  @Prop({ default: null })
  last_editor?: string;

  @Prop()
  create_update?: Date;

  @Prop()
  last_update?: Date;
}

export const AccountSchema = SchemaFactory.createForClass(Account);
