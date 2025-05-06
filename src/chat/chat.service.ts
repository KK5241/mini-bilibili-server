import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan } from 'typeorm';
import { ChatMessage } from '../entities/chat-message.entity';
import { ChatConversation } from '../entities/chat-conversation.entity';
import { User } from '../entities/user.entity';
import { SendMessageDto } from './dto/send-message.dto';

@Injectable()
export class ChatService {
  constructor(
    @InjectRepository(ChatMessage)
    private chatMessageRepository: Repository<ChatMessage>,
    @InjectRepository(ChatConversation)
    private chatConversationRepository: Repository<ChatConversation>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  // 发送消息
  async sendMessage(senderId: number, messageDto: SendMessageDto): Promise<ChatMessage> {
    const { receiverId, content } = messageDto;

    // 检查接收者是否存在
    const receiver = await this.userRepository.findOne({ where: { id: receiverId } });
    if (!receiver) {
      throw new NotFoundException(`接收者ID ${receiverId} 不存在`);
    }

    // 创建消息
    const message = this.chatMessageRepository.create({
      senderId,
      receiverId,
      content,
      isRead: false,
    });

    // 保存消息
    const savedMessage = await this.chatMessageRepository.save(message);

    // 更新或创建会话
    await this.updateOrCreateConversation(senderId, receiverId, savedMessage.id);

    return savedMessage;
  }

  // 更新或创建会话
  private async updateOrCreateConversation(user1Id: number, user2Id: number, lastMessageId: number): Promise<void> {
    // 确保user1Id小于user2Id，这样可以避免创建重复的会话
    let smallerId = user1Id;
    let largerId = user2Id;

    if (user1Id > user2Id) {
      smallerId = user2Id;
      largerId = user1Id;
    }

    // 尝试查找已存在的会话
    let conversation = await this.chatConversationRepository.findOne({
      where: { user1Id: smallerId, user2Id: largerId }
    });

    if (conversation) {
      // 更新现有会话
      conversation.lastMessageId = lastMessageId;
      
      // 只有接收者的未读计数增加，发送者不应该增加自己的未读计数
      // user1Id是发送者，user2Id是接收者
      const receiverId = user2Id;
      
      // 判断接收者是smallerId还是largerId
      if (receiverId === smallerId) {
        conversation.user1UnreadCount++;
      } else {
        conversation.user2UnreadCount++;
      }
      
      await this.chatConversationRepository.save(conversation);
    } else {
      // 创建新会话
      conversation = this.chatConversationRepository.create({
        user1Id: smallerId,
        user2Id: largerId,
        lastMessageId,
        // 只有接收者有未读消息
        user1UnreadCount: user2Id === smallerId ? 1 : 0,
        user2UnreadCount: user2Id === largerId ? 1 : 0,
      });
      await this.chatConversationRepository.save(conversation);
    }
  }

  // 获取用户的会话列表
  async getConversations(userId: number): Promise<any[]> {
    // 查询用户所有的会话
    const conversations = await this.chatConversationRepository
      .createQueryBuilder('conv')
      .where('conv.user1Id = :userId OR conv.user2Id = :userId', { userId })
      .orderBy('conv.updatedAt', 'DESC')
      .getMany();

    // 获取完整的会话信息
    const result = await Promise.all(
      conversations.map(async (conv) => {
        // 确定对方用户ID
        const otherUserId = conv.user1Id === userId ? conv.user2Id : conv.user1Id;
        
        // 获取对方用户信息
        const otherUser = await this.userRepository.findOne({
          where: { id: otherUserId },
          select: ['id', 'username', 'avatar']
        });

        // 获取最后一条消息
        const lastMessage = conv.lastMessageId 
          ? await this.chatMessageRepository.findOne({ where: { id: conv.lastMessageId } })
          : null;

        // 确定未读消息数
        const unreadCount = conv.user1Id === userId 
          ? conv.user1UnreadCount 
          : conv.user2UnreadCount;

        return {
          id: conv.id,
          otherUser,
          lastMessage,
          unreadCount,
          updatedAt: conv.updatedAt
        };
      })
    );

    return result;
  }

  // 获取与指定用户的消息历史
  async getMessageHistory(userId: number, otherUserId: number, page: number = 1, limit: number = 20): Promise<any> {
    const skip = (page - 1) * limit;
    
    // 获取两个用户之间的所有消息
    const messages = await this.chatMessageRepository.find({
      where: [
        { senderId: userId, receiverId: otherUserId },
        { senderId: otherUserId, receiverId: userId }
      ],
      relations: ['sender'],
      order: { createdAt: 'DESC' },
      skip,
      take: limit
    });

    // 标记消息为已读
    const unreadMessages = messages.filter(msg => 
      !msg.isRead && msg.receiverId === userId
    );

    if (unreadMessages.length > 0) {
      await Promise.all(
        unreadMessages.map(msg => {
          msg.isRead = true;
          return this.chatMessageRepository.save(msg);
        })
      );

      // 更新会话的未读计数
      await this.resetUnreadCount(userId, otherUserId);
    }

    const hasMore = messages.length === limit;

    return {
      messages: messages.reverse(), // 返回按时间正序排列的消息
      hasMore
    };
  }

  // 重置未读消息计数
  private async resetUnreadCount(userId: number, otherUserId: number): Promise<void> {
    let smallerId = userId;
    let largerId = otherUserId;

    if (userId > otherUserId) {
      smallerId = otherUserId;
      largerId = userId;
    }

    const conversation = await this.chatConversationRepository.findOne({
      where: { user1Id: smallerId, user2Id: largerId }
    });

    if (conversation) {
      if (userId === smallerId) {
        conversation.user1UnreadCount = 0;
      } else {
        conversation.user2UnreadCount = 0;
      }
      await this.chatConversationRepository.save(conversation);
    }
  }

  // 获取未读消息数
  async getUnreadCount(userId: number): Promise<number> {
    const conversations = await this.chatConversationRepository.find({
      where: [
        { user1Id: userId },
        { user2Id: userId }
      ]
    });

    return conversations.reduce((total, conv) => {
      const unreadCount = conv.user1Id === userId 
        ? conv.user1UnreadCount 
        : conv.user2UnreadCount;
      return total + unreadCount;
    }, 0);
  }
} 