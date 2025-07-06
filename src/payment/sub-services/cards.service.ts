import { Injectable, Inject } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { StripeService } from './stripe.service';
import { UserService } from 'src/user/user.service';
import { ObjectId } from 'bson';
import { SavedCard } from '../schema/savedCard.schema';
import { CreateCardDTO } from '../dto/createCard.request';

@Injectable()
export class CardsService {
  constructor(
    @InjectModel(SavedCard.name) private readonly cardModel: Model<SavedCard>,
    private readonly stripeService: StripeService,
    @Inject(UserService) private userService: UserService,
  ) {}

  async createStripeCustomer(user: any) {
    const customer = await this.stripeService.createOrFetchStripeCustomer(
      user.email,
    );
    await this.userService.findOneAndUpdate(
      { _id: new ObjectId(user._id.toString()) },
      { $set: { stripeCustomerId: customer.id } },
    );
    return { status: true, message: 'Stripe customer added', data: null };
  }

  async addCard(
    user: any,
    payload: CreateCardDTO,
    // customerId: string,
    // stripeCustomerId: string,
    // paymentMethodId: string,
  ) {
    const stripeCard = await this.stripeService.attachCard(
      payload.stripeCustomerId,
      payload.paymentMethodId,
    );

    await this.cardModel.create({
      customerId: new ObjectId(user._id.toString()),
      stripeCustomerId: payload.stripeCustomerId,
      cardId: stripeCard.id,
      brand: stripeCard.card.brand,
      last4: stripeCard.card.last4,
      expMonth: stripeCard.card.exp_month,
      expYear: stripeCard.card.exp_year,
      isDefault: true,
    });

    // Set the card as default in Stripe
    await this.stripeService.setDefaultCard(
      payload.stripeCustomerId,
      stripeCard.id,
    );
    return { status: true, message: 'Card saved', data: null };
  }

  async listCards(user: any) {
    return this.stripeService.listCards(user.stripeCustomerId);
    // return this.cardModel.find({ customerId: user._id });
  }

  async removeCard(customerId: string, paymentMethodId: string) {
    console.log(paymentMethodId);
    await this.stripeService.detachCard(paymentMethodId);
    await this.cardModel.deleteOne({
      customerId: new ObjectId(customerId),
      cardId: paymentMethodId,
    });
    return { status: true, message: 'Card detached', data: null };
  }
}
