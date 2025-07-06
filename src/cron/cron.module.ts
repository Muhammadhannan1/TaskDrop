import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import CronService from './cron.service';
import { NotificationsModule } from 'src/notifications/notifications.module';

@Module({
  imports: [ScheduleModule.forRoot(), NotificationsModule],
  providers: [CronService],
  controllers: [],
  exports: [],
})
export default class CronModule {}
