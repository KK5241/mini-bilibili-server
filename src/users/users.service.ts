import { Injectable, NotFoundException, ForbiddenException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from '../entities/user.entity';
import { Video } from '../entities/video.entity';
import { UserVideoInteraction } from '../entities/user-video-interaction.entity';
import { ViewHistory } from '../entities/view-history.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(Video)
    private videosRepository: Repository<Video>,
    @InjectRepository(UserVideoInteraction)
    private userVideoInteractionRepository: Repository<UserVideoInteraction>,
    @InjectRepository(ViewHistory)
    private viewHistoryRepository: Repository<ViewHistory>,
  ) {}

  async findAll(): Promise<User[]> {
    return this.usersRepository.find();
  }

  async findOne(id: number): Promise<User> {
    const user = await this.usersRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException(`用户ID ${id} 不存在`);
    }
    return user;
  }

  async findByUsername(username: string): Promise<User | null> {
    const user = await this.usersRepository.findOne({ 
      where: { username },
      select: ['id', 'username', 'password', 'role']
    });
    return user;
  }

  async create(createUserDto: CreateUserDto): Promise<User> {
    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
    const user = this.usersRepository.create({
      ...createUserDto,
      password: hashedPassword,
    });
    return this.usersRepository.save(user);
  }

  async update(id: number, updateUserDto: UpdateUserDto, currentUserId?: number): Promise<User> {
    const user = await this.findOne(id);
    
    if (user.id !== currentUserId) {
      throw new ForbiddenException('您只能更新自己的个人资料');
    }
    
    if (updateUserDto.password) {
      updateUserDto.password = await bcrypt.hash(updateUserDto.password, 10);
    }
    
    Object.assign(user, updateUserDto);
    return this.usersRepository.save(user);
  }

  async remove(id: number, currentUserId: number): Promise<void> {
    const user = await this.findOne(id);
    
    if (user.id !== currentUserId) {
      throw new ForbiddenException('您只能删除自己的账号');
    }
    
    await this.usersRepository.remove(user);
  }

  async followUser(userId: number, followId: number): Promise<void> {
    if (userId === followId) {
      throw new ForbiddenException('您不能关注自己');
    }

    const user = await this.usersRepository.findOne({
      where: { id: userId },
      relations: ['follows'],
    });
    
    if (!user) {
      throw new NotFoundException(`用户ID ${userId} 不存在`);
    }
    
    const userToFollow = await this.findOne(followId);
    
    const isAlreadyFollowing = user.follows && user.follows.some(f => f.id === followId);
    if (isAlreadyFollowing) {
      throw new ForbiddenException('您已经关注了该用户');
    }
    
    if (!user.follows) {
      user.follows = [];
    }
    
    user.follows.push(userToFollow);
    user.following += 1;
    userToFollow.followers += 1;
    
    await this.usersRepository.save(user);
    await this.usersRepository.save(userToFollow);
  }

  async unfollowUser(userId: number, followId: number): Promise<void> {
    const user = await this.usersRepository.findOne({
      where: { id: userId },
      relations: ['follows'],
    });
    
    if (!user) {
      throw new NotFoundException(`用户ID ${userId} 不存在`);
    }
    
    const userToUnfollow = await this.findOne(followId);
    
    if (!user.follows) {
      throw new ForbiddenException('您没有关注该用户');
    }
    
    const isFollowing = user.follows.some(f => f.id === followId);
    if (!isFollowing) {
      throw new ForbiddenException('您没有关注该用户');
    }
    
    user.follows = user.follows.filter(f => f.id !== followId);
    user.following -= 1;
    userToUnfollow.followers -= 1;
    
    await this.usersRepository.save(user);
    await this.usersRepository.save(userToUnfollow);
  }

  async getFollowers(userId: number): Promise<User[]> {
    // 查找关注了该用户的所有用户
    const followers = await this.usersRepository
      .createQueryBuilder('user')
      .innerJoin('user.follows', 'follows', 'follows.id = :userId', { userId })
      .getMany();
    
    return followers;
  }

  async getFollowing(userId: number): Promise<User[]> {
    const user = await this.usersRepository.findOne({
      where: { id: userId },
      relations: ['follows'],
    });
    
    if (!user) {
      throw new NotFoundException(`用户ID ${userId} 不存在`);
    }
    
    return user.follows || [];
  }

  async checkFollowStatus(userId: number, targetId: number): Promise<{ isFollowing: boolean }> {
    const user = await this.usersRepository.findOne({
      where: { id: userId },
      relations: ['follows'],
    });
    
    if (!user) {
      throw new NotFoundException(`用户ID ${userId} 不存在`);
    }
    
    const isFollowing = user.follows && user.follows.some(f => f.id === targetId);
    
    return { isFollowing };
  }

  async getUserProfile(id: number): Promise<any> {
    const user = await this.findOne(id);
    
    // 获取用户关注数和粉丝数
    const followingCount = user.following || 0;
    const followersCount = user.followers || 0;
    
    // 获取用户获赞总数
    const likeCount = await this.getUserLikeCount(id);
    
    return {
      ...user,
      followingCount,
      followersCount,
      likeCount
    };
  }

  private async getUserLikeCount(userId: number): Promise<number> {
    // 计算用户视频获得的点赞总数
    const videos = await this.videosRepository.find({
      where: { userId }
    });
    
    let totalLikes = 0;
    videos.forEach(video => {
      totalLikes += video.likes;
    });
    
    return totalLikes;
  }

  async getUserVideos(userId: number): Promise<Video[]> {
    // 获取用户发布的视频
    const videos = await this.videosRepository.find({
      where: { userId },
      relations: ['user'],
      order: { createdAt: 'DESC' }
    });
    
    return videos;
  }

  async getUserFavorites(userId: number): Promise<Video[]> {
    // 获取用户收藏的视频
    const interactions = await this.userVideoInteractionRepository.find({
      where: { userId, favorited: true },
      relations: ['video', 'video.user']
    });
    
    // 提取视频信息
    const videos = interactions.map(interaction => interaction.video);
    
    return videos;
  }

  async getViewHistory(userId: number): Promise<ViewHistory[]> {
    // 使用专门的观看历史表
    const history = await this.viewHistoryRepository.find({
      where: { userId },
      relations: ['video', 'video.user'],
      order: { watchedAt: 'DESC' },
      take: 50 // 限制返回数量
    });
    
    return history;
  }

  // 添加新的记录观看历史的方法
  async recordViewHistory(userId: number, videoId: number): Promise<void> {
    // 查找是否已存在该记录
    let history = await this.viewHistoryRepository.findOne({
      where: { userId, videoId }
    });
    
    if (history) {
      // 更新已有记录
      history.viewCount += 1;
      history.watchedAt = new Date();
      await this.viewHistoryRepository.save(history);
    } else {
      // 创建新记录
      history = this.viewHistoryRepository.create({
        userId,
        videoId,
        viewCount: 1,
        watchedAt: new Date()
      });
      await this.viewHistoryRepository.save(history);
    }
  }

  async updatePassword(userId: number, currentPassword: string, newPassword: string): Promise<void> {
    // 查询用户(包括密码字段)
    const user = await this.usersRepository.findOne({
      where: { id: userId },
      select: ['id', 'username', 'password']
    });
    
    if (!user) {
      throw new NotFoundException(`用户ID ${userId} 不存在`);
    }
    
    // 验证当前密码
    const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('当前密码不正确');
    }
    
    // 更新为新密码
    const hashedNewPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedNewPassword;
    
    await this.usersRepository.save(user);
  }
}