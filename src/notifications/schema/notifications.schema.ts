import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { IsIn } from 'class-validator';

export enum NotificationType {
  SERVICE = 'SERVICE',
  BOOKING = 'BOOKING',
  LEAVE = 'LEAVE',
  RATING = 'RATING',
  FAVORITE = 'FAVORITE',
  CHAT = 'CHAT',
}

export type NotificationDocument = Notification & Document;

@Schema({
  timestamps: true,
  versionKey: false,
  minimize: true,
  collection: 'notifications',
})
export class Notification {
  @Prop({ required: true })
  message: string;

  @Prop({ required: true })
  title: string;

  @Prop({ type: MongooseSchema.Types.Mixed, required: false })
  info?: Record<string, any>; // or just `any`

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'users', required: true })
  recieverId: MongooseSchema.Types.ObjectId; // This is the receiver's userId

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'users', required: true })
  senderId: MongooseSchema.Types.ObjectId; // This is the sender's userId

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: 'businesses',
    required: false,
  })
  businessId?: MongooseSchema.Types.ObjectId;

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: 'services',
    required: false,
  })
  serviceId?: MongooseSchema.Types.ObjectId;

  @Prop({ required: true })
  @IsIn(
    [
      NotificationType.BOOKING,
      NotificationType.SERVICE,
      NotificationType.LEAVE,
      NotificationType.RATING,
      NotificationType.FAVORITE,
      NotificationType.CHAT,
    ],
    {
      message:
        'Notification type must be one of [BOOKING, SERVICE, LEAVE, RATING, FAVORITE, CHAT]',
    },
  )
  type: NotificationType;
}

export const NotificationSchema = SchemaFactory.createForClass(Notification);
