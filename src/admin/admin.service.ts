import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Video } from '../entities/video.entity';
import { User } from '../entities/user.entity';
import { VideoReview } from '../entities/video-review.entity';
import { CreateUserDto } from './dto/create-user.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(Video)
    private videoRepository: Repository<Video>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(VideoReview)
    private videoReviewRepository: Repository<VideoReview>,
  ) {}

  // 获取待审核的视频列表
  async getPendingVideos() {
    try {
      const videos = await this.videoRepository.find({
        where: { reviewStatus: 'pending' },
        relations: ['user'],
        order: { createdAt: 'DESC' },
      });
      
      // 处理视频URL，确保前端能正确显示
      return videos.map(video => {
        if (video.cover && !video.cover.startsWith('http')) {
          const serverUrl = process.env.SERVER_URL || 'http://localhost:3000';
          video.cover = `${serverUrl}${video.cover}`;
        }
        
        if (video.videoUrl && !video.videoUrl.startsWith('http')) {
          const serverUrl = process.env.SERVER_URL || 'http://localhost:3000';
          video.videoUrl = `${serverUrl}${video.videoUrl}`;
        }
        
        return video;
      });
    } catch (error) {
      console.error('获取待审核视频失败:', error);
      return [];
    }
  }

  // 审核视频
  async reviewVideo(videoId: number, adminId: number, status: 'approved' | 'rejected', reason?: string) {
    const video = await this.videoRepository.findOne({ where: { id: videoId } });
    if (!video) {
      throw new NotFoundException('视频不存在');
    }

    if (video.reviewStatus !== 'pending') {
      throw new BadRequestException('该视频已经被审核过');
    }

    // 创建审核记录
    const review = this.videoReviewRepository.create({
      videoId,
      adminId,
      status,
      reason,
    });
    await this.videoReviewRepository.save(review);

    // 更新视频状态
    video.reviewStatus = status;
    await this.videoRepository.save(video);

    return review;
  }

  // 获取所有用户
  async getAllUsers() {
    try {
      return await this.userRepository.find({
        select: ['id', 'username', 'role', 'avatar', 'bio', 'followers', 'following', 'createdAt', 'updatedAt'],
        order: { createdAt: 'ASC' },
      });
    } catch (error) {
      console.error('获取所有用户失败:', error);
      return [];
    }
  }

  // 更新用户信息
  async updateUser(userId: number, data: Partial<User>) {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('用户不存在');
    }

    Object.assign(user, data);
    return this.userRepository.save(user);
  }

  // 删除用户
  async deleteUser(userId: number) {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('用户不存在');
    }

    // 使用事务处理，确保所有操作成功或全部回滚
    const queryRunner = this.userRepository.manager.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // 删除用户发布的所有视频相关数据
      const videos = await queryRunner.manager.find('video', { where: { userId } });
      for (const video of videos) {
        // 删除视频相关的弹幕
        await queryRunner.manager.delete('danmu', { videoId: video['id'] });
        
        // 删除视频相关的评论
        await queryRunner.manager.delete('comment', { videoId: video['id'] });
        
        // 删除视频相关的互动记录
        await queryRunner.manager.delete('user_video_interaction', { videoId: video['id'] });
        
        // 删除视频审核记录
        await queryRunner.manager.delete('video_review', { videoId: video['id'] });
      }
      
      // 删除用户的所有视频
      await queryRunner.manager.delete('video', { userId });
      
      // 删除用户发布的所有弹幕
      await queryRunner.manager.delete('danmu', { userId });
      
      // 删除用户的所有评论
      await queryRunner.manager.delete('comment', { userId });
      
      // 删除用户的观看历史
      await queryRunner.manager.delete('view_history', { userId });
      
      // 删除用户关注关系
      await queryRunner.manager.delete('user_followers', { followerId: userId });
      await queryRunner.manager.delete('user_followers', { followingId: userId });
      
      // 删除用户互动记录
      await queryRunner.manager.delete('user_video_interaction', { userId });
      
      // 删除用户聊天消息 (如果有)
      if (await queryRunner.manager.getRepository('chat_message')) {
        await queryRunner.manager.delete('chat_message', { senderId: userId });
        await queryRunner.manager.delete('chat_message', { receiverId: userId });
      }
      
      // 删除用户聊天会话 (如果有)
      if (await queryRunner.manager.getRepository('chat_conversation')) {
        await queryRunner.manager.delete('chat_conversation', { user1Id: userId });
        await queryRunner.manager.delete('chat_conversation', { user2Id: userId });
      }
      
      // 最后删除用户
      await queryRunner.manager.remove(user);
      
      // 提交事务
      await queryRunner.commitTransaction();
      
      return { message: '用户删除成功' };
    } catch (error) {
      // 如果发生错误，回滚事务
      await queryRunner.rollbackTransaction();
      console.error('删除用户失败:', error);
      throw new Error('删除用户失败: ' + error.message);
    } finally {
      // 释放查询运行器
      await queryRunner.release();
    }
  }

  // 创建新用户
  async createUser(createUserDto: CreateUserDto) {
    // 检查用户名是否已存在
    const existingUser = await this.userRepository.findOne({
      where: { username: createUserDto.username }
    });

    if (existingUser) {
      throw new ConflictException('用户名已存在');
    }

    // 加密密码
    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(createUserDto.password, salt);

    try {
      // 创建新用户
      const newUser = this.userRepository.create({
        username: createUserDto.username,
        password: hashedPassword,
        role: createUserDto.role,
        bio: createUserDto.bio || '',
        followers: 0,
        following: 0,
      });

      const savedUser = await this.userRepository.save(newUser);
      
      // 返回用户信息（不包含密码）
      const { password, ...result } = savedUser;
      return result;
    } catch (error) {
      console.error('创建用户失败:', error);
      throw new BadRequestException('创建用户失败: ' + error.message);
    }
  }

  // 删除视频
  async deleteVideo(videoId: number) {
    const video = await this.videoRepository.findOne({ where: { id: videoId } });
    if (!video) {
      throw new NotFoundException('视频不存在');
    }

    // 使用事务处理，确保所有操作成功或全部回滚
    const queryRunner = this.videoRepository.manager.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // 删除视频相关的弹幕（如果表存在）
      if (await queryRunner.hasTable('danmu')) {
        await queryRunner.manager.delete('danmu', { videoId });
      }
      
      // 删除视频相关的评论（如果表存在）
      if (await queryRunner.hasTable('comment')) {
        await queryRunner.manager.delete('comment', { videoId });
      }
      
      // 删除视频相关的互动记录（如果表存在）
      if (await queryRunner.hasTable('user_video_interaction')) {
        await queryRunner.manager.delete('user_video_interaction', { videoId });
      }
      
      // 删除视频审核记录（如果表存在）
      if (await queryRunner.hasTable('video_review')) {
        await queryRunner.manager.delete('video_review', { videoId });
      }

      // 删除视频观看历史（如果表存在）
      if (await queryRunner.hasTable('view_history')) {
        await queryRunner.manager.delete('view_history', { videoId });
      }

      // 删除视频收藏记录（如果表存在）
      if (await queryRunner.hasTable('video_favorite')) {
        await queryRunner.manager.delete('video_favorite', { videoId });
      }
      
      // 最后删除视频
      await queryRunner.manager.remove(video);
      
      // 提交事务
      await queryRunner.commitTransaction();
      
      return { message: '视频删除成功' };
    } catch (error) {
      // 如果发生错误，回滚事务
      await queryRunner.rollbackTransaction();
      console.error('删除视频失败:', error);
      throw new Error('删除视频失败: ' + error.message);
    } finally {
      // 释放查询运行器
      await queryRunner.release();
    }
  }
} 