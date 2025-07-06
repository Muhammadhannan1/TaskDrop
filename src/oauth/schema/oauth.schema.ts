import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { ObjectId } from 'mongodb';
import { UserOAuthType } from 'utils/Enums/auth/OAuth';

export type OAuthDocument = OAuth & Document;

@Schema({ timestamps: true, versionKey: false })
export class OAuth extends Document {
  @Prop({ required: true })
  userId: ObjectId;

  @Prop()
  providerId: string;

  @Prop()
  type: UserOAuthType;
}

export const OAuthSchema = SchemaFactory.createForClass(OAuth);
