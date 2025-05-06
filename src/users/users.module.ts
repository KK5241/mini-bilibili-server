import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { User } from '../entities/user.entity';
import { Video } from '../entities/video.entity';
import { UserVideoInteraction } from '../entities/user-video-interaction.entity';
import { ViewHistory } from '../entities/view-history.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      User,
      Video,
      UserVideoInteraction,
      ViewHistory
    ]),
  ],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}