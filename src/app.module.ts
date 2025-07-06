import {
  Logger,
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { APP_FILTER, APP_GUARD } from '@nestjs/core';
import { GenericExceptionFilter } from '../utils/exception/generic-exception.fliter';
// import { RedisCoreService } from './redis-core/redis-core.service';
import { HttpClientService } from 'utils/httpClient.service';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import { RedisCoreModule } from './redis-core/redis-core.module';
import { MongooseModule } from '@nestjs/mongoose';
import { NotificationsModule } from './notifications/notifications.module';
import { ChatModule } from './chat/chat.module';
import { MediaModule } from './media/media.module';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import OAuthModule from './oauth/oauth.module';
import { TokenModule } from './token/token.module';
import { HttpLoggerMiddleware } from 'utils/middlewares/http-loger.middleware';
import { SanitizationMiddleware } from 'utils/middlewares/sanitization.middleware';
import { seconds, ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import CronModule from './cron/cron.module';
import { PaymentModule } from './payment/payment.module';
import WinstonLoggerService from 'utils/middlewares/logger.middleware';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, // Make the config globally available across all modules
      envFilePath: './.env', // Specify the path to your .env file
    }),

    // ThrottlerModule.forRoot({
    //   throttlers: [
    //     {
    //       // ttl: 10 * 1000,
    //       ttl: seconds(60),
    //       limit: 60,
    //     },
    //   ],
    //   errorMessage: 'Too many requests, try again later',
    // }),

    MongooseModule.forRoot(process.env.DATABASE_URL),
    // RedisCoreModule,
    // HttpModule,
    // OAuthModule,
    // NotificationsModule,
    // ChatModule,
    // MediaModule,
    UserModule,
    // TokenModule,
    AuthModule,
    // CronModule,
    // PaymentModule,
  ],
  controllers: [AppController],
  providers: [
    Logger,
    AppService,
    // HttpClientService,
    {
      provide: APP_FILTER,
      useClass: GenericExceptionFilter,
    },
    // {
    //   provide: APP_GUARD,
    //   useClass: ThrottlerGuard,
    // },
    // RedisCoreService,
    WinstonLoggerService,
  ],
})
// export class AppModule {}
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(HttpLoggerMiddleware).forRoutes('*'); // Apply to all routes
    consumer
      .apply(SanitizationMiddleware)
      .forRoutes(
        { path: '*', method: RequestMethod.POST },
        { path: '*', method: RequestMethod.PUT },
        { path: '*', method: RequestMethod.PATCH },
      );
  }
}
