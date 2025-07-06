import { Module } from '@nestjs/common';
import { NotificationsController } from './notifications.controller';
import { NotificationsService } from './notifications.service';
import { ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';
import { RedisModule } from 'nestjs-redis';
import {
  Notification,
  NotificationSchema,
} from './schema/notifications.schema';
import { RedisCoreService } from 'src/redis-core/redis-core.service';
import { FirebaseAdminService } from './firebase.service';
import { BullModule } from '@nestjs/bull';
import { NotificationProcessor } from './Processor/bull.processor';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Notification.name, schema: NotificationSchema },
    ]),
    JwtModule.registerAsync({
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
      }),
      inject: [ConfigService],
    }),
    RedisModule,
    BullModule.registerQueue({
      name: 'notifications',
    }),
  ],
  controllers: [NotificationsController],
  providers: [
    NotificationsService,
    RedisCoreService,
    FirebaseAdminService,
    NotificationProcessor,
  ],
  exports: [NotificationsService],
})
export class NotificationsModule {}
