import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
  MessageBody
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { UseGuards } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ChatService } from './chat.service';
import { SendMessageDto } from './dto/send-message.dto';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private userSocketMap: Map<number, string> = new Map();
  private socketUserMap: Map<string, number> = new Map();

  constructor(
    private chatService: ChatService,
    private jwtService: JwtService
  ) {}

  async handleConnection(client: Socket): Promise<void> {
    try {
      // 从token中获取用户ID
      const token = client.handshake.auth.token || client.handshake.headers.authorization;
      if (!token) {
        client.disconnect();
        return;
      }

      // 验证token
      const payload = this.jwtService.verify(token.replace('Bearer ', ''));
      const userId = payload.sub;

      // 将用户ID与socket关联
      this.userSocketMap.set(userId, client.id);
      this.socketUserMap.set(client.id, userId);

      console.log(`用户 ${userId} 已连接`);
    } catch (error) {
      console.error('WebSocket连接错误:', error);
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket): void {
    const userId = this.socketUserMap.get(client.id);
    if (userId) {
      this.userSocketMap.delete(userId);
      this.socketUserMap.delete(client.id);
      console.log(`用户 ${userId} 已断开连接`);
    }
  }

  @SubscribeMessage('sendMessage')
  async handleSendMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: SendMessageDto
  ): Promise<void> {
    try {
      const senderId = this.socketUserMap.get(client.id);
      if (!senderId) {
        client.emit('messageSent', { success: false, error: '用户未授权' });
        return;
      }

      // 保存消息到数据库
      const message = await this.chatService.sendMessage(senderId, payload);

      // 获取发送者信息
      const sender = { id: senderId };

      // 发送消息给接收者(如果在线)
      const receiverSocketId = this.userSocketMap.get(payload.receiverId);
      if (receiverSocketId) {
        this.server.to(receiverSocketId).emit('receiveMessage', {
          ...message,
          sender
        });
      }

      // 发送确认回执给发送者
      client.emit('messageSent', { 
        success: true, 
        messageId: message.id,
        message: {
          ...message,
          sender
        }
      });
    } catch (error) {
      console.error('发送消息错误:', error);
      client.emit('messageSent', { success: false, error: error.message });
    }
  }

  @SubscribeMessage('markAsRead')
  async handleMarkAsRead(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { otherUserId: number }
  ): Promise<void> {
    try {
      const userId = this.socketUserMap.get(client.id);
      if (!userId) {
        client.emit('messagesMarkedAsRead', { success: false, error: '用户未授权' });
        return;
      }

      // 标记消息为已读
      await this.chatService.getMessageHistory(userId, payload.otherUserId);
      
      // 通知发送确认
      client.emit('messagesMarkedAsRead', { success: true });
      
      // 通知对方消息已读
      const otherUserSocketId = this.userSocketMap.get(payload.otherUserId);
      if (otherUserSocketId) {
        this.server.to(otherUserSocketId).emit('messagesRead', { 
          userId,
          otherUserId: payload.otherUserId 
        });
      }
    } catch (error) {
      console.error('标记消息已读错误:', error);
      client.emit('messagesMarkedAsRead', { success: false, error: error.message });
    }
  }
} 