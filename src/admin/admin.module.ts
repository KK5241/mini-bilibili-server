import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { Video } from '../entities/video.entity';
import { User } from '../entities/user.entity';
import { VideoReview } from '../entities/video-review.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Video, User, VideoReview]),
  ],
  controllers: [AdminController],
  providers: [AdminService],
})
export class AdminModule {} 