import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ versionKey: false, timestamps: true })
export class Refund extends Document {
  @Prop({ type: Types.ObjectId, ref: 'Payment', required: true })
  paymentId: Types.ObjectId; // Reference to the original payment

  @Prop({ required: true })
  refundAmount: number; // Amount refunded

  @Prop({ required: true })
  currency: string; // Currency of the refund

  @Prop({ required: true })
  refundId: string; // Stripe Refund ID

  @Prop({ required: true })
  status: 'pending' | 'processed'; // Refund status
}

export const RefundSchema = SchemaFactory.createForClass(Refund);
