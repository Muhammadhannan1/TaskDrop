import { Inject, Logger } from '@nestjs/common';
import {
  OnGatewayInit,
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ChatService } from './chat.service';
import { ChatType } from 'utils/Enums/chats/ChatType';

interface CustomSocket extends Socket {
  user_details: {
    email: string;
    userType: string;
    userId: string;
  };
}

@WebSocketGateway({ cors: true })
export class ChatGateway
  implements
    OnGatewayInit<Server>,
    OnGatewayConnection<Socket>,
    OnGatewayDisconnect<Socket>
{
  constructor(@Inject(ChatService) private readonly chatService: ChatService) {}

  private logger = new Logger('ChatGateway');

  // private userSocketMap = {};
  private userSocketMap = new Map();

  @WebSocketServer() server: Server;

  afterInit(server: Server) {
    this.server = server;
    this.logger.log('socket init');
  }

  async handleConnection(socket: CustomSocket) {
    const user = await this.chatService.getUserFromSocket(socket);
    if (!user) return socket.disconnect();

    // set user data in socket and in custom Map
    socket.user_details = user;
    this.userSocketMap.set(user.userId.toString(), socket.id);

    // update user online status
    await this.chatService.setUserOnlineStatus(user.userId, true);
    this.logger.log(
      `Client ${socket.id} connected, user ==> ${JSON.stringify(socket.user_details)}`,
    );

    // extract all roomIds in which user is participant and emit that user has joined (OPTIONAL)
    // const roomIds = await this.chatService.getUserRoomIds(socket.user_details.userId);
    // this.server.to(roomIds).emit('user_connected_status', { data: { connected: true } });
  }

  async handleDisconnect(socket: any) {
    if (socket.user_details) {
      this.userSocketMap.delete(socket.user_details.userId.toString());
      await this.chatService.setUserOnlineStatus(
        socket.user_details.userId,
        false,
      );

      // extract all roomIds in which user is participant and emit that user has joined (OPTIONAL)
      /** 
      const roomIds = await this.chatService.getUserRoomIds(socket.user_details.userId);
      this.server.to(roomIds).emit('user_connected_status', { data: { connected: false } });
      */
    }
    this.logger.log(`Client ${socket.id} disconnected`);
  }

  // join room
  @SubscribeMessage('join_room')
  async joinRoom(
    socket: CustomSocket,
    data: { roomId: string; message: string },
  ): Promise<any> {
    if (typeof data === 'string') {
      data = JSON.parse(data);
    }
    // Check if data is valid
    if (!data || !data.roomId || typeof data.roomId !== 'string') {
      this.logger.error('Invalid join_room data:', data);
      return { status: false, message: `Invalid room ID ${data.roomId}` };
    }
    // join the room and log
    socket.join(data.roomId);
    this.logger.log(`${socket.user_details.email} joins room: ${data.roomId}`);

    /**
     * @NOTE : you can return all messages on join_room event or you can implement another event if there is need of pagination
     */

    const allMessages = await this.chatService.getAllMessages(
      data.roomId,
      socket.user_details,
    );
    if (allMessages.data === undefined) {
      socket.leave(data.roomId);
    }

    /**
     * @NOTE : Below code is optional use only if required too much feature like realtime blue ticks
     * check planzee sockets to get more help for implementation
     */

    /**
    await this.chatService.updateLastReadEvent(data.roomId, socket.user_details.userId);
    const isFullyRead = await this.chatService.checkIfAllRead(Number(data.roomId));
    if (isFullyRead) {
        socket.to(data.roomId).emit('userJoined', { userId: socket.user_details.userId, readByAll: true });
    } else {
        socket.to(data.roomId).emit('userJoined', { userId: socket.user_details.userId, readByAll: false });
    }
     */
    return allMessages;
  }

  // leave room
  @SubscribeMessage('leave_room')
  async leaveRoom(
    socket: CustomSocket,
    data: { roomId: string },
  ): Promise<any> {
    if (typeof data === 'string') {
      data = JSON.parse(data);
    }
    data.roomId.toString();
    if (!socket.rooms.has(data.roomId)) {
      return {
        status: false,
        message: 'Can not leave room which is not joined',
        data: null,
      };
    }
    socket.leave(data.roomId);
    this.logger.log(`${socket.user_details.email} leaves room: ${data.roomId}`);
  }

  @SubscribeMessage('send_message')
  /**
   * @NOTE : There is no media upload support in chat implemented here you can check NMO backend for that
   */
  async sendMessage(
    socket: CustomSocket,
    data: {
      message?: string;
      mediaIds?: number[];
      roomId: string;
      chatType: ChatType;
      friendId?: number;
      // eventId?: number; //it is not usefull here can remove this
    },
  ) {
    /**
     * @NOTE : there is a adivce if you want to emit message before creating in database for fast request response then generate an ObjectId for mongoDB and uuid for sql and return it with the message
     * and let frontend reqeust further actions with that so tracking is easy
     * but beware this is some tricky
     * */

    if (typeof data === 'string') {
      data = JSON.parse(data);
    }
    data.roomId.toString();
    // Check if the sender is in the room
    if (!socket.rooms.has(data.roomId)) {
      return { status: false, message: 'You are not in the room' };
    }
    let temp: any = {
      senderId: socket.user_details.userId,
      message: data.message,
      roomId: Number(data.roomId),
    };

    /**
     * @NOTE : Check how many users have joined the current room in which message is emitting so that make the read stauts true by default
     * This is optional use only if full featured realtime chat is required add the roomJoinedUserIds in the createMessage param and make read status true for those users in queries
     */

    /**
    const roomSockets = this.server.sockets.adapter.rooms.get(data.roomId);
    let roomJoinedUserIds: number[];
    if (roomSockets) {
      roomJoinedUserIds = Array.from(roomSockets).map((socketId) => {
        const socket: any = this.server.sockets.sockets.get(socketId);
        // console.log(socket);
        return socket.user_details.userId; // Extract the userId from each socket's user_details
      });
    }
    */
    const message = await this.chatService.createMessage(temp);

    this.server.to(data.roomId).emit('new_message', { data: message });

    /**
     * @NOTE : if chat type is individual and opposite user is online then send an event on chat listing to update the listing
     * check planzee for help what is going on here
     * This is optional implement only if demand
     * */
    if (
      data.chatType === ChatType.INDIVIDUAL &&
      this.userSocketMap.get(data.friendId.toString())
    ) {
      /** 
      const friendData = await this.chatService.singleFriendChatListData(
        socket.user_details.userId,
        data.friendId,
      );
      this.server
        .to(this.userSocketMap.get(data.friendId.toString()))
        .emit('notify_friend_for_new_listing', { data: friendData });
      */
    }

    /**
     * @NOTE : if chat type is group get all the room users who are online and send an event which contain group chat general data to updata chat listing
     * check planzee for help what is going on here
     * This is optional implement only if demand
     * */
    if (data.chatType === ChatType.GROUP) {
      /** 
      const chatParticipants = await this.chatv2Service.getChatParticipants(
        Number(data.roomId),
      );
      const participantIds: number[] = chatParticipants.map(
        (participant) => participant.userId,
      );
      const socketIds: string[] = participantIds.map((id) => {
        if (this.userSocketMap.has(id.toString())) {
          return this.userSocketMap.get(id.toString());
        }
      });
      const chatData = await this.chatv2Service.singleGroupChatData(
        socket.user_details.userId,
        data.eventId,
        Number(data.roomId),
      );
      this.server
        .to(socketIds)
        .emit('notify_friend_for_new_listing', { data: chatData });
        */
    }
  }

  @SubscribeMessage('chat_listing')
  async chatListing(socket: CustomSocket) {
    const listing = await this.chatService.chatListing(
      socket.user_details.userId,
    );
    if (!listing.length) {
      return { status: true, message: 'Chats Not Found', data: null };
    }
    return { status: true, message: 'Chats Found', data: listing };
  }
}
