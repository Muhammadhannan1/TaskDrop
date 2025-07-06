import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Payment } from './schema/payment.schema';
import { Refund } from './schema/refund.schema';
import { InitiatePaymentDTO } from './dto/initiatePayment.request';
import { ObjectId } from 'bson';
import { RefundDTO } from './dto/refund.request';
import { StripeCaptureMethod } from 'utils/Enums/Payment/stripeCaptureMethod';
import { PaymentStatus } from 'utils/Enums/Payment/paymentStatus';
import { StripeService } from './sub-services/stripe.service';

@Injectable()
export class PaymentService {
  constructor(
    @InjectModel(Payment.name) private readonly paymentModel: Model<Payment>,
    @InjectModel(Refund.name) private readonly refundModel: Model<Refund>,
    private readonly stripeService: StripeService,
  ) {}

  async initiatePayment(user: any, data: InitiatePaymentDTO) {
    const intentData = {
      amount: data.amount,
      currency: data.currency,
      stripeCustomerId: user.stripeCustomerId,
      payment_methodId: data.payment_methodId,
      description: data.description,
      captureMethod: StripeCaptureMethod.MANUAL,
    };
    const paymentIntent =
      await this.stripeService.createPaymentIntent(intentData);
    const payment = await this.paymentModel.create({
      customerId: new ObjectId(data.customerId),
      vendorId: new ObjectId(data.vendorId),
      bookingId: new ObjectId(data.bookingId),
      services: data.services,
      paymentIntentId: paymentIntent.id,
      amount: data.amount,
      currency: data.currency,
      status: PaymentStatus.PENDING,
      description: data.description,
    });
    return { status: true, message: 'Payment intiated', data: null };
  }

  async authorizePayment(paymentIntentId: string) {
    return await this.stripeService.confirmPaymentIntent(paymentIntentId);
  }

  async capturePayment(paymentIntentId: string) {
    return await this.stripeService.capturePaymentIntent(paymentIntentId);
  }

  async confirmAndCapturePayment(paymentIntentId: string) {
    try {
      // Step 1: Confirm the PaymentIntent
      const confirmedPaymentIntent =
        await this.stripeService.confirmPaymentIntent(paymentIntentId);

      // Step 2: Check PaymentIntent status after confirmation
      if (confirmedPaymentIntent.status === 'requires_capture') {
        // Step 3: If capturable, capture the PaymentIntent
        const capturedPaymentIntent =
          await this.stripeService.capturePaymentIntent(paymentIntentId);
        await this.paymentModel.findOneAndUpdate(
          { paymentIntentId },
          { $set: { status: PaymentStatus.CAPTURED } },
        );
        // Return the captured payment details
        return {
          status: 'success',
          message: 'Payment captured successfully.',
          data: capturedPaymentIntent,
        };
      } else if (confirmedPaymentIntent.status === 'succeeded') {
        // If already succeeded, return success
        return {
          status: 'success',
          message: 'Payment has already been captured successfully.',
          data: confirmedPaymentIntent,
        };
      } else {
        // If the status is not capturable or already succeeded, throw an error
        throw new BadRequestException(
          `PaymentIntent cannot be captured. Current status: ${confirmedPaymentIntent.status}`,
        );
      }
    } catch (error) {
      // Handle Stripe-specific errors
      if (error.type === 'StripeInvalidRequestError') {
        // Invalid paymentIntentId or missing PaymentIntent
        if (error.code === 'resource_missing') {
          throw new BadRequestException(
            'The PaymentIntent ID is invalid or does not exist.',
          );
        }

        // Insufficient funds or incorrect parameters
        if (error.code === 'parameter_invalid_integer') {
          throw new BadRequestException(
            'The amount is invalid or insufficient.',
          );
        }
      }

      if (error.type === 'StripeCardError') {
        // Card-specific errors
        if (error.code === 'card_declined') {
          throw new BadRequestException(
            'The card was declined. Please try another card.',
          );
        }
        if (error.code === 'insufficient_funds') {
          throw new BadRequestException('The card has insufficient funds.');
        }
        if (error.code === 'expired_card') {
          throw new BadRequestException('The card has expired.');
        }
        if (error.code === 'incorrect_cvc') {
          throw new BadRequestException('The CVC code is incorrect.');
        }
      }

      if (error.type === 'StripeAPIError') {
        // Unexpected Stripe API errors
        throw new InternalServerErrorException(
          'An error occurred while processing the payment. Please try again later.',
        );
      }

      // Catch-all for unhandled errors
      throw new InternalServerErrorException(
        error.message || 'An unexpected error occurred.',
      );
    }
  }

  async cancelPayment(paymentIntentId: string) {
    try {
      // Attempt to cancel the PaymentIntent via Stripe
      const canceledPaymentIntent =
        await this.stripeService.cancelPaymentIntent(paymentIntentId);

      // Check if the cancellation was successful
      if (canceledPaymentIntent.status !== 'canceled') {
        throw new BadRequestException(
          `Failed to cancel PaymentIntent. Current status: ${canceledPaymentIntent.status}`,
        );
      }

      // Update the payment status in the database
      const updatedPayment = await this.paymentModel.findOneAndUpdate(
        { paymentIntentId },
        { $set: { status: PaymentStatus.CANCELLED } },
        { new: true }, // Return the updated document
      );

      // If no document was updated, it means the PaymentIntent was not found in the database
      if (!updatedPayment) {
        throw new NotFoundException(
          'Payment record not found for the given PaymentIntent ID.',
        );
      }

      return {
        status: true,
        message: 'Payment Cancelled successfully.',
        data: updatedPayment,
      };
    } catch (error) {
      // Handle Stripe errors
      if (error.type === 'StripeAPIError') {
        if (error.code === 'payment_intent_not_found') {
          throw new NotFoundException('PaymentIntent not found.');
        }
        if (error.code === 'invalid_request_error') {
          throw new BadRequestException('Invalid PaymentIntent ID.');
        }

        // Handle case when the PaymentIntent is already canceled
        if (error.code === 'payment_intent_canceled') {
          throw new BadRequestException('Payment has already been canceled.');
        }

        // Handle other Stripe-specific errors
        throw new InternalServerErrorException(
          `Stripe error: ${error.message}`,
        );
      }

      // Handle MongoDB errors or other unexpected errors
      if (error.name === 'MongoError') {
        throw new InternalServerErrorException(
          'Error updating payment status in the database.',
        );
      }

      // Catch-all for any other errors
      throw new InternalServerErrorException(
        error.message || 'An unexpected error occurred.',
      );
    }
  }

  async refundPayment(payload: RefundDTO) {
    const refund = await this.stripeService.createRefund(
      payload.paymentIntentId,
      payload.amount,
    );
    const newRefund = new this.refundModel({
      paymentId: payload.paymentIntentId,
      refundAmount: refund.amount / 100, // Convert cents to original currency
      currency: payload.currency,
      refundId: refund.id,
      status: 'processed',
    });
    return newRefund.save();
  }

  async createTestPaymentMethod(email: string) {
    const paymentMethod =
      await this.stripeService.createTestPaymentMethod(email);
    return {
      status: true,
      message: 'paymentMethod.id',
      data: paymentMethod,
    };
  }
}
