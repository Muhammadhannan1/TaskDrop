import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { RedisCoreService } from 'src/redis-core/redis-core.service';
import {
  Notification,
  NotificationDocument,
  NotificationType,
} from './schema/notifications.schema';
import { Model } from 'mongoose';
import { ObjectId } from 'mongodb';
import { FirebaseAdminService } from './firebase.service';
import { testNotificationDTO } from './dto/testCreate.dto';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectModel(Notification.name)
    private notificationModel: Model<NotificationDocument>,

    private readonly _firebase: FirebaseAdminService,
    // private readonly _redis_core: RedisCoreService,

    @InjectQueue('notifications') private readonly notificationQueue: Queue,
  ) {}

  // async sendNotificationOnQueue(
  //   notificationData: any,
  //   fn: () => Promise<any>,
  //   fnArgs?: any,
  // ) {
  //   await this.notificationQueue.add('sendNotification', {
  //     ...notificationData,
  //     fn: fn.toString(), // Serialize the function
  //     fnArgs,
  //   });
  // }

  async sendNotificationOnQueue(notificationData: any) {
    await this.notificationQueue.add('sendNotification', notificationData);
  }

  async test(payload: testNotificationDTO) {
    if (payload.fcm !== null && typeof payload.fcm === 'string') {
      await this._firebase.push(payload.fcm, {
        message: payload.message,
        title: payload.title,
        data: payload.info,
        topic: payload.type,
      });
    }

    if (Array.isArray(payload.fcm) && payload.fcm.length > 0) {
      await this._firebase.pushMulti(payload.fcm, {
        message: payload.message,
        title: payload.title,
        data: payload.info,
        topic: payload.type,
      });
    }

    if (payload.recieverId !== null && typeof payload.recieverId === 'string') {
      await this.notificationModel.create({
        title: payload.title,
        message: payload.message,
        senderId: new ObjectId(payload.senderId),
        recieverId: new ObjectId(payload.recieverId),
        businessId: new ObjectId(payload.businessId),
        type: NotificationType.RATING,
        info: payload.info,
        hasBeenRead: payload.hasBeenRead,
      });
    }

    if (Array.isArray(payload.recieverId) && payload.recieverId.length !== 0) {
      const tasks = payload.recieverId.map(async (id: string) => {
        return {
          title: payload.title,
          message: payload.message,
          senderId: new ObjectId(payload.senderId),
          recieverId: new ObjectId(id),
          businessId: new ObjectId(payload.businessId),
          serviceId: new ObjectId(payload.serviceId),
          type: payload.type,
          info: payload.info,
        };
      });

      const notifications = await Promise.all(tasks);
      await this.notificationModel.insertMany(notifications);
    }
  }

  async deleteMany(filter: any) {
    return await this.notificationModel.deleteMany(filter);
  }

  async sendPushNotification({
    fcm,
    title,
    message,
    topic,
    additionalInfo,
  }: PushNotificationType): Promise<any> {
    if (fcm !== null && typeof fcm === 'string') {
      await this._firebase.push(fcm, {
        message,
        title,
        data: additionalInfo || null,
        topic,
      });
    }
  }

  async get(user: any): Promise<any> {
    // const cacheKey = getUserNotificationListCacheKey(user._id.toString()); // Cache key
    // const cachedNotifications = await this._redis_core.get(cacheKey);

    // if (cachedNotifications) {
    //   return {
    //     status: true,
    //     message: 'notifications found',
    //     data: JSON.parse(cachedNotifications),
    //   };
    // }

    const now = new Date();

    // Define date ranges
    const todayStart = new Date(now.setHours(0, 0, 0, 0));
    const todayEnd = new Date(now.setHours(23, 59, 59, 999));

    const lastWeekStart = new Date();
    lastWeekStart.setDate(now.getDate() - 7);
    const lastWeekEnd = new Date();

    // Perform aggregation
    const notifications = await this.notificationModel.aggregate([
      { $match: { recieverId: new ObjectId(user._id as string) } },
      {
        $lookup: {
          from: 'users',
          localField: 'senderId',
          foreignField: '_id',
          as: 'senderData',
          pipeline: [
            {
              $project: {
                _id: 1,
                name: 1,
                email: 1,
                profilePic: 1,
                gender: 1,
                phone: 1,
              },
            },
          ],
        },
      },
      {
        $addFields: {
          senderData: { $arrayElemAt: ['$senderData', 0] },
          period: {
            $cond: [
              {
                $and: [
                  { $gte: ['$createdAt', todayStart] },
                  { $lte: ['$createdAt', todayEnd] },
                ],
              },
              'Today',
              {
                $cond: [
                  {
                    $and: [
                      { $gte: ['$createdAt', lastWeekStart] },
                      { $lte: ['$createdAt', lastWeekEnd] },
                    ],
                  },
                  'Last Week',
                  null,
                ],
              },
            ],
          },
        },
      },

      // Remove documents that don't fall into "Today" or "Last Week"
      { $match: { period: { $ne: null } } },

      {
        $sort: { createdAt: -1 }, // Sort notifications by createdAt (descending)
      },

      // Group notifications by period
      {
        $group: {
          _id: '$period',
          count: { $sum: 1 },
          data: { $push: '$$ROOT' },
        },
      },
      {
        $addFields: {
          sortOrder: {
            $cond: [{ $eq: ['$_id', 'Today'] }, 0, 1],
          },
        },
      },
      { $sort: { sortOrder: 1 } }, // Sort by sortOrder to ensure "Today" comes first
      // Project the final structure
      {
        $project: {
          title: '$_id',
          count: 1,
          data: {
            $map: {
              input: '$data',
              as: 'item',
              in: {
                _id: '$$item._id',
                message: '$$item.message',
                title: '$$item.title',
                createdAt: '$$item.createdAt',
                senderId: '$$item.senderId',
                recieverId: '$$item.recieverId',
                hasBeenRead: '$$item.hasBeenRead',
                type: '$$item.type',
                senderData: '$$item.senderData', // Include senderData here directly
              },
            },
          },
          _id: 0,
        },
      },
    ]);

    // await this._redis_core.setex(cacheKey, notifications);

    return {
      status: true,
      message: 'notifications found',
      data: notifications,
    };
  }

  async bookService({
    fcm,
    message,
    senderId,
    title,
    info,
    serviceId,
    recieverId,
    businessId,
  }: notificationType): Promise<any> {
    if (Array.isArray(fcm) && fcm.length > 0) {
      // await this._firebase.pushMulti(fcm, {
      //   message,
      //   title,
      //   data: info,
      //   topic: NotificationType.BOOKING,
      // });
    }

    if (Array.isArray(recieverId) && recieverId.length > 0) {
      const tasks = recieverId.map(async (recieverId) => {
        // const userNotificationCacheKey =
        //   getUserNotificationListCacheKey(recieverId);

        // Delete cache for the user's notifications
        // await this._redis_core.del(userNotificationCacheKey);

        // Return the notification object
        return {
          title,
          message,
          senderId: new ObjectId(senderId),
          recieverId: new ObjectId(recieverId),
          businessId: new ObjectId(businessId),
          // serviceId: new ObjectId(serviceId),
          type: NotificationType.BOOKING,
          info,
        };
      });
      // Await all tasks to complete
      const notifications = await Promise.all(tasks);

      await this.insertMany(notifications);
    }
  }

  async serviceReminder({
    fcm,
    message,
    senderId,
    title,
    info,
    serviceId,
    recieverId,
    businessId,
  }: notificationType): Promise<any> {
    if (Array.isArray(fcm) && fcm.length > 0) {
      await this._firebase.pushMulti(fcm, {
        message,
        title,
        data: info,
        topic: NotificationType.BOOKING,
      });
    }

    if (Array.isArray(recieverId) && recieverId.length > 0) {
      const tasks = recieverId.map(async (recieverId) => {
        return {
          title,
          message,
          senderId: new ObjectId(senderId),
          recieverId: new ObjectId(recieverId),
          businessId: new ObjectId(businessId),
          // serviceId: new ObjectId(serviceId),
          type: NotificationType.BOOKING,
          info,
        };
      });

      const notifications = await Promise.all(tasks);

      await this.insertMany(notifications);
    }
  }

  async rateBusiness(data: notificationType): Promise<any> {
    const { fcm, message, senderId, title, info, businessId, recieverId } =
      data;

    console.log('rateBusiness data =?>', data);

    if (fcm !== null && typeof fcm === 'string') {
      // await this._firebase.push(fcm, {
      //   message,
      //   title,
      //   data: info,
      //   topic: NotificationType.RATING,
      // });
    }

    console.log('we are in rate business function ');

    if (recieverId !== null && typeof recieverId === 'string') {
      await this.notificationModel.create({
        title,
        message,
        senderId: new ObjectId(senderId),
        recieverId: new ObjectId(recieverId),
        businessId: new ObjectId(businessId),
        type: NotificationType.RATING,
        info,
      });
    }
  }

  async acceptBooking({
    fcm,
    message,
    senderId,
    title,
    info,
    recieverId,
  }: notificationType) {
    if (fcm !== null && typeof fcm === 'string') {
      // await this._firebase.push(fcm, {
      //   message,
      //   title,
      //   data: info,
      //   topic: NotificationType.BOOKING,
      // });
    }

    if (recieverId !== null && typeof recieverId === 'string') {
      await this.notificationModel.create({
        title,
        message,
        senderId: new ObjectId(senderId),
        recieverId: new ObjectId(recieverId),
        type: NotificationType.BOOKING,
        info,
      });
    }
  }

  async likeBusiness({
    fcm,
    message,
    senderId,
    title,
    info,
    businessId,
    recieverId,
  }: notificationType) {
    if (fcm !== null && typeof fcm === 'string') {
      // await this._firebase.push(fcm, {
      //   message,
      //   title,
      //   data: info,
      //   topic: NotificationType.FAVORITE,
      // });
    }

    if (typeof recieverId === 'string') {
      await this.notificationModel.create({
        title,
        message,
        senderId: new ObjectId(senderId),
        recieverId: new ObjectId(recieverId),
        businessId: new ObjectId(businessId),
        type: NotificationType.FAVORITE,
        info,
      });
    }
  }

  async leaveRequest({
    fcm,
    message,
    senderId,
    title,
    info,
    recieverId,
    businessId,
  }: notificationType) {
    if (fcm !== null && typeof fcm === 'string') {
      // await this._firebase.push(fcm, {
      //   message,
      //   title,
      //   data: info,
      //   topic: NotificationType.LEAVE,
      // });
    }

    if (typeof recieverId === 'string') {
      await this.notificationModel.create({
        title,
        message,
        senderId: new ObjectId(senderId),
        recieverId: new ObjectId(recieverId),
        businessId: new ObjectId(businessId),
        type: NotificationType.LEAVE,
        info,
      });
    }
  }

  async approveLeave({
    fcm,
    message,
    senderId,
    title,
    info,
    recieverId,
    businessId,
  }: notificationType) {
    if (fcm !== null && typeof fcm === 'string') {
      // await this._firebase.push(fcm, {
      //   message,
      //   title,
      //   data: info,
      //   topic: NotificationType.LEAVE,
      // });
    }

    if (typeof recieverId === 'string') {
      await this.notificationModel.create({
        title,
        message,
        senderId: new ObjectId(senderId),
        recieverId: new ObjectId(recieverId),
        businessId: new ObjectId(businessId),
        type: NotificationType.LEAVE,
        info,
      });
    }
  }

  async initiateSingleChat({
    fcm,
    message,
    senderId,
    title,
    info,
    recieverId,
  }: notificationType) {
    if (fcm !== null && typeof fcm === 'string') {
      // await this._firebase.push(fcm, {
      //   message,
      //   title,
      //   data: info,
      //   topic: NotificationType.LEAVE,
      // });
    }

    if (typeof recieverId === 'string') {
      await this.notificationModel.create({
        title,
        message,
        senderId: new ObjectId(senderId),
        recieverId: new ObjectId(recieverId),
        type: NotificationType.CHAT,
        info,
      });
    }
  }

  async deleteNotification(query: Record<string, any>): Promise<any> {
    try {
      // Validate the query object
      if (Object.keys(query).length === 0) {
        throw new BadRequestException('Query object cannot be empty');
      }

      // Delete notifications based on the query
      const result = await this.notificationModel.deleteMany(query);

      if (result.deletedCount > 0) {
        console.log(`${result.deletedCount} notifications deleted.`);
      } else {
        console.log('No notifications matched the query.');
      }

      return result;
    } catch (error) {
      console.error('Error deleting notifications:', error);
    }
  }

  private async insertOne(data: any) {
    return await this.notificationModel.create(data);
  }

  private async insertMany(data: any[]) {
    return await this.notificationModel.insertMany(data);
  }
}

interface notificationType {
  fcm: string | string[];
  title: string;
  message: string;
  senderId: string; // user hitting the api

  info?: any;

  recieverId?: string | string[];
  businessId?: string;
  serviceId?: string;
}

interface PushNotificationType {
  fcm: string;
  topic: string;
  title: string;
  message: string;
  additionalInfo: any;
}

/**
 * @NOTE : how to hit a notification in the api (when using @nestjs/bull)
 * */
//  const notificationData: _NotificationData = {
//       fcm: '',
//       message: `${user.name} has left a review: "${review.reviewText}".`,
//       senderId: user._id as string,
//       title: `${user.name} has rated your business`,
//       info: {
//         reviewId: review._id,
//         reviewText: review.reviewText,
//         rating: review.rating,
//       },
//       recieverId: businessExist[0]?.vendorId?.toString(),
//       businessId: payload.businessId,
//       fnName: 'rateBusiness', // important
//     };

//     // await this._notification.rateBusiness(notificationData); // without bull
//     // console.log('before');

//     await this._notification.sendNotificationOnQueue(notificationData);

//     // console.log('after');
