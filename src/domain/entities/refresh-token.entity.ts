import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type RefreshTokenDocument = RefreshToken & Document;

@Schema({ timestamps: { createdAt: 'created_at', updatedAt: 'last_update' } })
export class RefreshToken {
  @Prop({ unique: true })
  id: number;

  @Prop({ required: true })
  account_id: number;

  @Prop({ required: true })
  token: string;

  @Prop()
  jwt_id?: string;

  @Prop({ required: true })
  expires_at: Date;

  @Prop({ default: false })
  is_used: boolean;

  @Prop({ default: false })
  is_revoked: boolean;

  @Prop()
  created_by_ip?: string;

  @Prop()
  created_by_user_id?: number;

  @Prop()
  created_at?: Date;

  @Prop()
  last_update?: Date;
}

export const RefreshTokenSchema = SchemaFactory.createForClass(RefreshToken);
