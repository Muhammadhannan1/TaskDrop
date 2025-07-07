import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import Stripe from 'stripe';
import { StripeCaptureMethod } from 'utils/Enums/Payment/stripeCaptureMethod';

@Injectable()
export class StripeService {
  private stripe: Stripe;

  constructor() {
    this.stripe = new Stripe(process.env.STRIPE_API_KEY, {
      apiVersion: "2025-02-24.acacia",
    });
  }

  // Attach card to Stripe customer
  async attachCard(stripeCustomerId: string, paymentMethodId: string) {
    return this.stripe.paymentMethods.attach(paymentMethodId, {
      customer: stripeCustomerId,
    });
  }

  // List saved cards
  async listCards(stripeCustomerId: string) {
    const cards = await this.stripe.paymentMethods.list({
      customer: stripeCustomerId,
      type: 'card',
    });

    const filteredData = cards.data.map((cardData) => {
      return {
        ...cardData.card,
        paymentMethodId: cardData.id,
        created: cardData.created,
        customer: cardData.customer,
        livemode: cardData.livemode,
        metadata: cardData.metadata,
        type: cardData.type,
      };
    });
    return { status: true, message: 'Saved cards', data: filteredData };
  }

  // Remove card
  async detachCard(paymentMethodId: string) {
    return this.stripe.paymentMethods.detach(paymentMethodId);
  }

  // Set default payment method
  async setDefaultCard(stripeCustomerId: string, paymentMethodId: string) {
    return this.stripe.customers.update(stripeCustomerId, {
      invoice_settings: {
        default_payment_method: paymentMethodId,
      },
    });
  }

  // Create or fetch Stripe customer
  async createOrFetchStripeCustomer(email: string) {
    const customers = await this.stripe.customers.list({ email });
    if (customers.data.length > 0) {
      return customers.data[0];
    }
    return await this.stripe.customers.create({ email });
  }

  // PaymentIntent related operations
  async createPaymentIntent(data: {
    amount: number;
    currency: string;
    stripeCustomerId: string;
    payment_methodId: string;
    description?: string;
    captureMethod?: StripeCaptureMethod;
  }) {
    try {
      const intent = await this.stripe.paymentIntents.create({
        amount: Math.round(data.amount * 100), // Convert amount to cents
        currency: data.currency,
        customer: data.stripeCustomerId,
        payment_method: data.payment_methodId,
        capture_method: data.captureMethod || 'manual',
        automatic_payment_methods: {
          enabled: true,
          allow_redirects: 'never', // Disable redirects
        },
      });
      return intent;
    } catch (error) {
      if (error.type === 'StripeCardError') {
        // Handle card-specific errors
        if (error.code === 'card_declined') {
          throw new BadRequestException(
            'The card was declined. Please use another card.',
          );
        }
        if (error.code === 'insufficient_funds') {
          throw new BadRequestException('The card does not have enough funds.');
        }
        if (error.code === 'incorrect_cvc') {
          throw new BadRequestException('The CVC code is incorrect.');
        }
        if (error.code === 'expired_card') {
          throw new BadRequestException('The card has expired.');
        }
        if (error.code === 'incorrect_number') {
          throw new BadRequestException('The card number is incorrect.');
        }
      }

      if (error.type === 'StripeInvalidRequestError') {
        // Handle invalid payment method or currency
        if (error.code === 'payment_method_unexpected_state') {
          throw new BadRequestException(
            'Invalid or unexpected payment method.',
          );
        }
        if (error.code === 'invalid_currency') {
          throw new BadRequestException(
            'The currency is not supported by the payment method.',
          );
        }
      }

      if (error.type === 'StripeAPIError') {
        // Handle already confirmed or canceled PaymentIntent
        if (error.code === 'payment_intent_unexpected_state') {
          throw new InternalServerErrorException(
            'The PaymentIntent is in an invalid state (already confirmed or canceled).',
          );
        }
      }

      // Generic fallback for unexpected errors
      throw new InternalServerErrorException(
        error.message || 'An unexpected error occurred.',
      );
    }
  }

  async confirmPaymentIntent(paymentIntentId: string) {
    return this.stripe.paymentIntents.confirm(paymentIntentId);
  }

  async capturePaymentIntent(paymentIntentId: string) {
    return this.stripe.paymentIntents.capture(paymentIntentId);
  }

  async cancelPaymentIntent(paymentIntentId: string) {
    return this.stripe.paymentIntents.cancel(paymentIntentId);
  }

  async createRefund(paymentIntentId: string, amount?: number) {
    return this.stripe.refunds.create({
      payment_intent: paymentIntentId,
      amount: amount ? Math.round(amount * 100) : undefined,
    });
  }

  async createTestPaymentMethod(email: string) {
    // const paymentMethod = await this.stripe.paymentMethods.create({
    //   type: 'card',
    //   card: {
    //     number: '4242424242424242', // Test card number
    //     exp_month: 12,
    //     exp_year: 2025,
    //     cvc: '123',
    //   },
    // });
    const testToken = 'tok_mastercard'; // For example, 'tok_visa' is a predefined test token for a Visa card

    const paymentMethod = await this.stripe.paymentMethods.create({
      type: 'card',
      card: {
        token: testToken,
      },
    });
    // console.log('Payment Method attached to customer:', paymentMethod.id);
    return paymentMethod.id;
    // console.log('Payment Method ID:', paymentMethod.id);
  }
}
