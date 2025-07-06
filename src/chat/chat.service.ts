import { Injectable } from '@nestjs/common';
import { Socket } from 'socket.io';

@Injectable()
export class ChatService {
  async getUserFromSocket(socket: Socket) {
    let token: any = socket.handshake.query.token;

    // const user: any = await this.authService.getUserFromAuthToken(token);
    const user = {
      email: 'test',
      userType: 'test',
      userId: 'test',
    };
    if (!user) return false;
    return user;
  }

  async setUserOnlineStatus(userId: string, status: boolean) {
    // update user online status in schema
  }

  async getAllMessages(roomId: string, user: any) {
    // get all the messages in return from database
    const data = undefined;
    return { status: true, message: 'Messages', data };
  }

  async createMessage(
    data: CreateMessageRequest,
    /**
     * @NOTE : uncomment below line if required based on the feature
     * */

    // roomJoinedUserIds: string[],
  ) {
    // create message in DB according to you and return
  }

  async chatListing(userId: string) {
    const listing = [];
    return listing;
  }
}

interface CreateMessageRequest {
  senderId: number;
  message: string;
  roomId: number;
  media?: number[];
}
