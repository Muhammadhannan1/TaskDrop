import { Inject, Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { NotificationsService } from 'src/notifications/notifications.service';

@Injectable()
export default class CronService {
  constructor(
    @Inject(NotificationsService)
    private readonly _notification: NotificationsService,
  ) {}

  @Cron(CronExpression.EVERY_HOUR, { name: 'test' })
  HandleTestMessage() {
    console.log("===> Generated from test cron <===', '[CRON]");
  }
}
