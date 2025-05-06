import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from './users/users.module';
import { VideosModule } from './videos/videos.module';
import { CommentsModule } from './comments/comments.module';
import { AuthModule } from './auth/auth.module';
import { User } from './entities/user.entity';
import { Video } from './entities/video.entity';
import { Comment } from './entities/comment.entity';
import { Danmu } from './entities/danmu.entity';
import { UserVideoInteraction } from './entities/user-video-interaction.entity';
import { ConfigModule } from '@nestjs/config';
import { ViewHistory } from './entities/view-history.entity';
import { UploadsModule } from './uploads/uploads.module';
import { ChatMessage } from './entities/chat-message.entity';
import { ChatConversation } from './entities/chat-conversation.entity';
import { ChatModule } from './chat/chat.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT) || 3306,
      username: process.env.DB_USERNAME || 'root',
      password: process.env.DB_PASSWORD || 'password',
      database: process.env.DB_DATABASE || 'bilibili',
      entities: [
        User, 
        Video, 
        Comment, 
        Danmu, 
        UserVideoInteraction, 
        ViewHistory,
        ChatMessage,
        ChatConversation
      ],
      synchronize: false, // 不要在生产环境使用
    }),
    UsersModule,
    VideosModule,
    CommentsModule,
    AuthModule,
    UploadsModule,
    ChatModule,
  ],
})
export class AppModule {} 