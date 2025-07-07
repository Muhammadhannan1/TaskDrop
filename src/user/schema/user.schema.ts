import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Logger } from '@nestjs/common';
import { Document, Types } from 'mongoose';
import { ObjectId } from 'bson';

export type UserDocument = User & Document;

@Schema()
export class User extends Document {
  @Prop()
  name: string;

  @Prop({ index: { unique: true, sparse: true }, required: true })
  email: string;

  @Prop()
  password: string;

  @Prop()
  type: string;

  @Prop({ 
    default: function() {
      return `https://api.dicebear.com/7.x/avataaars/svg?seed=${this.email || 'default'}`;
    }
  })
  avatar: string;

  @Prop({ default: () => new Date() })
  createdAt: Date;

  @Prop({ default: () => new Date() })
  updatedAt: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);
