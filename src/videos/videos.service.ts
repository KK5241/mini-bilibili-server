import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { Video } from '../entities/video.entity';
import { CreateVideoDto } from './dto/create-video.dto';
import { UpdateVideoDto } from './dto/update-video.dto';
import { UserVideoInteraction } from '../entities/user-video-interaction.entity';
import { ViewHistory } from '../entities/view-history.entity';
import { log } from 'console';
import { UploadsService } from '../uploads/uploads.service';

@Injectable()
export class VideosService {
  constructor(
    @InjectRepository(Video)
    private videosRepository: Repository<Video>,
    @InjectRepository(UserVideoInteraction)
    private userVideoInteractionRepository: Repository<UserVideoInteraction>,
    @InjectRepository(ViewHistory)
    private viewHistoryRepository: Repository<ViewHistory>,
    private uploadsService: UploadsService
  ) {}

  async findAll(): Promise<Video[]> {
    const videos = await this.videosRepository.find({
      relations: ['user'],
    });
    
    // 处理每个视频的文件路径
    return videos.map(video => this.processVideoFileUrls(video));
  }

  async findPopular(): Promise<Video[]> {
    const videos = await this.videosRepository.find({
      relations: ['user'],
      order: {
        views: 'DESC',
      },
      take: 10,
    });
    
    // 处理每个视频的文件路径
    return videos.map(video => this.processVideoFileUrls(video));
  }

  async findRecent(): Promise<Video[]> {
    const videos = await this.videosRepository.find({
      relations: ['user'],
      order: {
        createdAt: 'DESC',
      },
      take: 10,
    });
    
    // 处理每个视频的文件路径
    return videos.map(video => this.processVideoFileUrls(video));
  }

  async search(query: string, sort?: string, limit?: number): Promise<Video[]> {
    const queryBuilder = this.videosRepository.createQueryBuilder('video')
      .leftJoinAndSelect('video.user', 'user')
      .where('video.title LIKE :query', { query: `%${query}%` })
      .orWhere('video.description LIKE :query', { query: `%${query}%` })
      .orWhere('user.username LIKE :query', { query: `%${query}%` });

    // 根据排序参数设置排序
    switch (sort) {
      case 'latest':
        queryBuilder.orderBy('video.createdAt', 'DESC');
        break;
      case 'popular':
        queryBuilder.orderBy('video.views', 'DESC');
        break;
      case 'likes':
        queryBuilder.orderBy('video.likes', 'DESC');
        break;
      default:
        // 默认按相关性排序 (通过创建时间 + 观看数来近似)
        queryBuilder.addOrderBy('video.views', 'DESC')
                    .addOrderBy('video.createdAt', 'DESC');
    }

    // 确保limit是数字类型
    const takeLimit = limit ? parseInt(String(limit), 10) : 20;
    
    // 限制返回结果数量
    queryBuilder.take(takeLimit);

    const videos = await queryBuilder.getMany();
    
    // 处理每个视频的文件路径
    return videos.map(video => this.processVideoFileUrls(video));
  }

  async findOne(id: number): Promise<Video> {
    const video = await this.videosRepository.findOne({
      where: { id },
      relations: ['user', 'comments', 'comments.user'],
    });
    
    if (!video) {
      throw new NotFoundException(`视频ID ${id} 不存在`);
    }
    
    // 处理视频的文件路径
    return this.processVideoFileUrls(video);
  }

  async create(userId: number, createVideoDto: CreateVideoDto): Promise<Video> {
    // 确保视频路径和封面路径不包含服务器URL前缀
    const videoData = { ...createVideoDto };
    
    // 如果视频URL和封面包含完整的服务器地址，则去除前缀部分，只保存相对路径
    const serverUrl = process.env.SERVER_URL || 'http://localhost:3000';
    
    if (videoData.videoUrl && videoData.videoUrl.startsWith(serverUrl)) {
      videoData.videoUrl = videoData.videoUrl.replace(serverUrl, '');
    }
    
    if (videoData.cover && videoData.cover.startsWith(serverUrl)) {
      videoData.cover = videoData.cover.replace(serverUrl, '');
    }
    
    const video = this.videosRepository.create({
      ...videoData,
      userId,
    });
    
    const savedVideo = await this.videosRepository.save(video);
    
    // 返回处理过的视频对象，包含完整URL
    return this.processVideoFileUrls(savedVideo);
  }

  async update(id: number, userId: number, updateVideoDto: UpdateVideoDto): Promise<Video> {
    const video = await this.findOne(id);
    
    if (video.userId !== userId) {
      throw new ForbiddenException('您只能更新自己的视频');
    }
    
    // 确保视频路径和封面路径不包含服务器URL前缀
    const videoData = { ...updateVideoDto };
    
    // 如果视频URL和封面包含完整的服务器地址，则去除前缀部分，只保存相对路径
    const serverUrl = process.env.SERVER_URL || 'http://localhost:3000';
    
    if (videoData.videoUrl && videoData.videoUrl.startsWith(serverUrl)) {
      videoData.videoUrl = videoData.videoUrl.replace(serverUrl, '');
    }
    
    if (videoData.cover && videoData.cover.startsWith(serverUrl)) {
      videoData.cover = videoData.cover.replace(serverUrl, '');
    }
    
    // 更新视频数据
    Object.assign(video, videoData);
    
    const updatedVideo = await this.videosRepository.save(video);
    
    // 返回处理过的视频对象，包含完整URL
    return this.processVideoFileUrls(updatedVideo);
  }

  async delete(id: number, userId: number): Promise<void> {
    const video = await this.findOne(id);
    
    if (video.userId !== userId) {
      throw new ForbiddenException('您只能删除自己的视频');
    }
    
    await this.videosRepository.remove(video);
  }

  async addView(id: number, userId?: number): Promise<Video> {
    const video = await this.findOne(id);
    video.views += 1;
    
    // 如果有用户ID，记录观看历史
    if (userId) {
      await this.recordViewHistory(userId, id);
    }
    
    const updatedVideo = await this.videosRepository.save(video);
    
    // 返回处理过的视频对象，包含完整URL
    return this.processVideoFileUrls(updatedVideo);
  }

  // 记录观看历史
  private async recordViewHistory(userId: number, videoId: number): Promise<void> {
    try {
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
    } catch (error) {
      console.error('记录观看历史失败:', error);
      // 这里我们不抛出异常，因为观看历史记录失败不应影响视频的观看
    }
  }

  async addLike(id: number, userId: number): Promise<Video> {
    const video = await this.findOne(id);
    
    // 查找用户对该视频的互动记录
    let interaction = await this.userVideoInteractionRepository.findOne({
      where: { userId, videoId: id }
    });
    
    // 如果没有记录，创建一个新记录
    if (!interaction) {
      interaction = this.userVideoInteractionRepository.create({
        userId,
        videoId: id,
        liked: false
      });
    }
    
    // 切换点赞状态
    if (interaction.liked) {
      // 已点赞，取消点赞
      interaction.liked = false;
      video.likes = Math.max(0, video.likes - 1); // 确保不会小于0
    } else {
      // 未点赞，添加点赞
      interaction.liked = true;
      video.likes += 1;
    }
    
    // 保存互动记录和视频
    await this.userVideoInteractionRepository.save(interaction);
    const updatedVideo = await this.videosRepository.save(video);
    
    // 返回处理过的视频对象，包含完整URL
    return this.processVideoFileUrls(updatedVideo);
  }

  async addFavorite(id: number, userId: number): Promise<Video> {
    const video = await this.findOne(id);
    
    // 查找用户对该视频的互动记录
    let interaction = await this.userVideoInteractionRepository.findOne({
      where: { userId, videoId: id }
    });
    
    // 如果没有记录，创建一个新记录
    if (!interaction) {
      interaction = this.userVideoInteractionRepository.create({
        userId,
        videoId: id,
        favorited: false
      });
    }
    
    // 切换收藏状态
    if (interaction.favorited) {
      // 已收藏，取消收藏
      interaction.favorited = false;
      video.favorites = Math.max(0, video.favorites - 1); // 确保不会小于0
    } else {
      // 未收藏，添加收藏
      interaction.favorited = true;
      video.favorites += 1;
    }
    
    // 保存互动记录和视频
    await this.userVideoInteractionRepository.save(interaction);
    const updatedVideo = await this.videosRepository.save(video);
    
    // 返回处理过的视频对象，包含完整URL
    return this.processVideoFileUrls(updatedVideo);
  }

  async addShare(id: number, userId: number): Promise<Video> {
    const video = await this.findOne(id);
    
    // 查找用户对该视频的互动记录
    let interaction = await this.userVideoInteractionRepository.findOne({
      where: { userId, videoId: id }
    });
    
    // 如果没有记录，创建一个新记录
    if (!interaction) {
      interaction = this.userVideoInteractionRepository.create({
        userId,
        videoId: id,
        shared: false
      });
    }
    
    // 切换分享状态
    if (interaction.shared) {
      // 已分享，取消分享状态（但不减少分享数，因为分享已经发生）
      interaction.shared = false;
    } else {
      // 未分享，添加分享
      interaction.shared = true;
      video.shares += 1;
    }
    
    // 保存互动记录和视频
    await this.userVideoInteractionRepository.save(interaction);
    const updatedVideo = await this.videosRepository.save(video);
    
    // 返回处理过的视频对象，包含完整URL
    return this.processVideoFileUrls(updatedVideo);
  }

  // 获取用户与视频的互动状态
  async getUserVideoInteraction(videoId: number, userId: number): Promise<UserVideoInteraction> {
    const interaction = await this.userVideoInteractionRepository.findOne({
      where: { userId, videoId }
    });
    
    return interaction || { 
      liked: false, 
      favorited: false, 
      shared: false 
    } as UserVideoInteraction;
  }

  // 获取热搜词
  async getHotSearches(): Promise<string[]> {
    // 直接查询播放量最高的前五个视频
    const popularVideos = await this.videosRepository.find({
      select: ['title'],
      order: { views: 'DESC' },
      take: 5,
    });

    // 提取视频标题作为热搜词
    const hotSearches = popularVideos.map(video => video.title);
    
    return hotSearches;
  }

  // 获取搜索建议
  async getSearchSuggestions(query: string): Promise<string[]> {
    if (!query.trim()) {
      return this.getHotSearches(); // 如果查询为空，返回热搜词
    }

    // 直接模糊查询匹配的视频标题
    const videos = await this.videosRepository.find({
      select: ['title'],
      where: { title: Like(`%${query}%`) },
      take: 5,
    });

    // 提取视频标题作为搜索建议
    return videos.map(video => video.title);
  }

  // 处理视频文件URL的辅助方法
  private processVideoFileUrls(video: Video): Video {
    // 创建视频对象的副本，避免直接修改原始数据
    const processedVideo = { ...video };
    
    // 处理视频封面URL
    if (processedVideo.cover) {
      processedVideo.cover = this.uploadsService.getFileUrl(processedVideo.cover);
    }
    
    // 处理视频文件URL
    if (processedVideo.videoUrl) {
      processedVideo.videoUrl = this.uploadsService.getFileUrl(processedVideo.videoUrl);
    }
    
    // 确保用户信息不会丢失
    if (video.user) {
      processedVideo.user = { ...video.user };
    }
    
    return processedVideo;
  }
} 