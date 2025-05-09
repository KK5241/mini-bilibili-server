import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Request } from '@nestjs/common';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { CreateUserDto } from './dto/create-user.dto';

@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  // 获取待审核的视频列表
  @Get('videos/pending')
  async getPendingVideos() {
    return this.adminService.getPendingVideos();
  }

  // 审核视频
  @Post('videos/:id/review')
  async reviewVideo(
    @Param('id') videoId: number,
    @Request() req,
    @Body() body: { status: 'approved' | 'rejected'; reason?: string },
  ) {
    return this.adminService.reviewVideo(videoId, req.user.id, body.status, body.reason);
  }

  // 获取所有用户
  @Get('users')
  async getAllUsers() {
    console.log('getAllUsers')
    return this.adminService.getAllUsers();
  }

  // 创建新用户
  @Post('users')
  async createUser(@Body() createUserDto: CreateUserDto) {
    return this.adminService.createUser(createUserDto);
  }

  // 更新用户信息
  @Put('users/:id')
  async updateUser(
    @Param('id') userId: number,
    @Body() data: any,
  ) {
    return this.adminService.updateUser(userId, data);
  }

  // 删除用户
  @Delete('users/:id')
  async deleteUser(@Param('id') userId: number) {
    console.log('deleteUser', userId)
    return this.adminService.deleteUser(userId);
  }

  // 删除视频
  @Delete('videos/:id')
  async deleteVideo(@Param('id') videoId: number) {
    return this.adminService.deleteVideo(videoId);
  }
} 