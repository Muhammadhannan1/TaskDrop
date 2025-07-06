import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ versionKey: false, timestamps: true })
export class SavedCard extends Document {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  customerId: Types.ObjectId; // Reference to the user

  @Prop({ required: true })
  cardId: string; // Stripe Payment Method ID for the saved card

  @Prop({ required: true })
  brand: string; // Card brand (e.g., 'Visa', 'Mastercard')

  @Prop({ required: true })
  last4: string; // Last 4 digits of the card

  @Prop({ required: true })
  expMonth: number; // Expiration month

  @Prop({ required: true })
  expYear: number; // Expiration year

  @Prop({ default: false })
  isDefault: boolean; // Indicates if this is the default card
}

export const SavedCardSchema = SchemaFactory.createForClass(SavedCard);
