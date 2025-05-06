import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VideosController } from './videos.controller';
import { VideosService } from './videos.service';
import { Video } from '../entities/video.entity';
import { UserVideoInteraction } from '../entities/user-video-interaction.entity';
import { ViewHistory } from '../entities/view-history.entity';
import { UploadsModule } from '../uploads/uploads.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Video, 
      UserVideoInteraction,
      ViewHistory
    ]),
    UploadsModule
  ],
  controllers: [VideosController],
  providers: [VideosService],
  exports: [VideosService],
})
export class VideosModule {}