import { 
  Controller, 
  Get, 
  Post, 
  Body, 
  UseGuards, 
  Request, 
  Param, 
  Query, 
  ParseIntPipe 
} from '@nestjs/common';
import { ChatService } from './chat.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { SendMessageDto } from './dto/send-message.dto';

@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  // 获取当前用户的会话列表
  @UseGuards(JwtAuthGuard)
  @Get('conversations')
  getConversations(@Request() req) {
    return this.chatService.getConversations(req.user.id);
  }

  // 获取与指定用户的消息历史
  @UseGuards(JwtAuthGuard)
  @Get('messages/:userId')
  getMessageHistory(
    @Request() req,
    @Param('userId', ParseIntPipe) otherUserId: number,
    @Query('page') page?: number,
    @Query('limit') limit?: number
  ) {
    return this.chatService.getMessageHistory(
      req.user.id, 
      otherUserId, 
      page || 1, 
      limit || 20
    );
  }

  // 发送消息
  @UseGuards(JwtAuthGuard)
  @Post('messages')
  sendMessage(
    @Request() req,
    @Body() messageDto: SendMessageDto
  ) {
    return this.chatService.sendMessage(req.user.id, messageDto);
  }

  // 获取未读消息数
  @UseGuards(JwtAuthGuard)
  @Get('unread-count')
  getUnreadCount(@Request() req) {
    return this.chatService.getUnreadCount(req.user.id);
  }
} 