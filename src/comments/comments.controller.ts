import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  UseGuards,
  Request,
  ParseIntPipe
} from '@nestjs/common';
import { CommentsService } from './comments.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CreateCommentDto } from './dto/create-comment.dto';

@Controller('comments')
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @Get('video/:videoId')
  getVideoComments(@Param('videoId', ParseIntPipe) videoId: number) {
    return this.commentsService.findByVideoId(videoId);
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Body() createCommentDto: CreateCommentDto, @Request() req) {
    return this.commentsService.create(createCommentDto, req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number, @Request() req) {
    return this.commentsService.remove(id, req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/like')
  likeComment(@Param('id', ParseIntPipe) id: number) {
    return this.commentsService.likeComment(id);
  }
} 