import { Module } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { PaymentController } from './payment.controller';
import { Payment, PaymentSchema } from './schema/payment.schema';
import { MongooseModule } from '@nestjs/mongoose';
import { RedisModule } from 'nestjs-redis';
import { RedisCoreService } from 'src/redis-core/redis-core.service';
import { JwtModule } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { SavedCard, SavedCardSchema } from './schema/savedCard.schema';
import { Refund, RefundSchema } from './schema/refund.schema';
import { UserModule } from 'src/user/user.module';
import { StripeService } from './sub-services/stripe.service';
import { CardsService } from './sub-services/cards.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Payment.name, schema: PaymentSchema }]),
    MongooseModule.forFeature([
      { name: SavedCard.name, schema: SavedCardSchema },
    ]),
    MongooseModule.forFeature([{ name: Refund.name, schema: RefundSchema }]),
    RedisModule,
    JwtModule.registerAsync({
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
      }),
      inject: [ConfigService],
    }),
    UserModule,
  ],
  providers: [PaymentService, RedisCoreService, StripeService, CardsService],
  controllers: [PaymentController],
  exports: [PaymentService],
})
export class PaymentModule {}
