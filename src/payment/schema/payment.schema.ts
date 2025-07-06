import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { IsIn } from 'class-validator';
import { Document, Types } from 'mongoose';
import { PaymentStatus } from 'utils/Enums/Payment/paymentStatus';

@Schema({ versionKey: false, timestamps: true, minimize: true, capped: true })
export class Payment extends Document {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  customerId: Types.ObjectId; // Reference to the user making the payment

  @Prop({ type: Types.ObjectId, ref: 'Business', required: true })
  vendorId: Types.ObjectId; // Reference to the vendor receiving the payment

  @Prop({ type: Types.ObjectId, ref: 'Booking', required: true })
  bookingId: Types.ObjectId; // Reference to the vendor receiving the payment

  @Prop({ type: [Types.ObjectId], ref: 'Service', required: true })
  services: Types.ObjectId[]; // Services included in this payment

  @Prop({ required: true })
  amount: number; // Total amount of the payment

  @Prop({ required: true })
  currency: string; // Currency (e.g., 'usd', 'eur')

  @Prop({ required: true })
  paymentIntentId: string; // Stripe Payment Intent ID

  @Prop({
    required: true,
  })
  @IsIn([
    PaymentStatus.PENDING,
    PaymentStatus.AUTHORIZED,
    PaymentStatus.CAPTURED,
    PaymentStatus.CANCELLED,
  ])
  status: string; // Payment status

  @Prop()
  description: string; // Optional description for the payment
}

export const PaymentSchema = SchemaFactory.createForClass(Payment);
