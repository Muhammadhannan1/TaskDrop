import { Processor, Process } from '@nestjs/bull';
import { Job } from 'bull';
import { NotificationsService } from '../notifications.service';

@Processor('notifications')
export class NotificationProcessor {
  constructor(private readonly _notification: NotificationsService) {}

  @Process('sendNotification')
  async handleNotification(job: Job) {
    const fnName = job.data.fnName;

    // console.log('jonb data ==>', job.data);

    if (typeof this._notification[fnName] === 'function') {
      const targetFunction = this._notification[fnName].bind(
        this._notification,
      );

      try {
        // Call the target function with the notification data
        await targetFunction(job.data);
      } catch (error) {
        console.error(`Error calling function ${fnName}:`, error);
      }
    } else {
      console.error(`Function ${fnName} not found on NotificationService`);
    }
  }
}
