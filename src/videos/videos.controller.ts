import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  ParseIntPipe
} from '@nestjs/common';
import { VideosService } from './videos.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CreateVideoDto } from './dto/create-video.dto';
import { UpdateVideoDto } from './dto/update-video.dto';

@Controller('videos')
export class VideosController {
  constructor(private readonly videosService: VideosService) {}

  @Get()
  findAll() {
    return this.videosService.findAll();
  }

  @Get('popular')
  findPopular() {
    return this.videosService.findPopular();
  }

  @Get('recent')
  findRecent() {
    return this.videosService.findRecent();
  }

  @Get('hot-searches')
  getHotSearches() {
    return this.videosService.getHotSearches();
  }

  @Get('search-suggestions')
  getSearchSuggestions(@Query('q') query: string) {
    return this.videosService.getSearchSuggestions(query);
  }

  @Get('search')
  search(
    @Query('q') query: string, 
    @Query('sort') sort?: string, 
    @Query('limit') limit?: string
  ) {
    // 如果提供了limit参数，尝试将其转换为数字
    const parsedLimit = limit ? parseInt(limit, 10) : undefined;
    
    return this.videosService.search(query, sort, parsedLimit);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.videosService.findOne(id);
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Body() createVideoDto: CreateVideoDto, @Request() req) {
    console.log(req.user,CreateVideoDto);
    
    return this.videosService.create(req.user.id, createVideoDto);
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateVideoDto: UpdateVideoDto,
    @Request() req
  ) {
    return this.videosService.update(id, req.user.id, updateVideoDto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  delete(@Param('id', ParseIntPipe) id: number, @Request() req) {
    return this.videosService.delete(id, req.user.id);
  }
  @UseGuards(JwtAuthGuard)
  @Post(':id/view')
  addView(
    @Param('id', ParseIntPipe) id: number,
    @Request() req?: any
  ) {
    // 获取用户ID（如果已登录）
    const userId = req.user?.id;
    return this.videosService.addView(id, userId);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/like')
  addLike(@Param('id', ParseIntPipe) id: number, @Request() req) {
    return this.videosService.addLike(id, req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/favorite')
  addFavorite(@Param('id', ParseIntPipe) id: number, @Request() req) {
    return this.videosService.addFavorite(id, req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/share')
  addShare(@Param('id', ParseIntPipe) id: number, @Request() req) {
    return this.videosService.addShare(id, req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id/interaction')
  getUserVideoInteraction(
    @Param('id', ParseIntPipe) id: number, 
    @Request() req
  ) {
    return this.videosService.getUserVideoInteraction(id, req.user.id);
  }

  @Get('my')
  @UseGuards(JwtAuthGuard)
  async getMyVideos(@Request() req) {
    return this.videosService.getVideosByUserId(req.user.id);
  }
} 