import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
  UseGuards,
  Request,
  ParseIntPipe,
} from "@nestjs/common";
import { UsersService } from "./users.service";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { CreateUserDto } from "./dto/create-user.dto";
import { UpdateUserDto } from "./dto/update-user.dto";
import { UpdatePasswordDto } from "./dto/update-password.dto";
import { log } from "console";

@Controller("users")
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  @Get(":id")
  findOne(@Param("id", ParseIntPipe) id: number) {
    return this.usersService.findOne(id);
  }

  @Get(":id/profile")
  getUserProfile(@Param("id", ParseIntPipe) id: number) {
    return this.usersService.getUserProfile(id);
  }

  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @UseGuards(JwtAuthGuard)
  @Put(":id")
  update(
    @Param("id", ParseIntPipe) id: number,
    @Body() updateUserDto: UpdateUserDto,
    @Request() req
  ) {
    return this.usersService.update(id, updateUserDto, req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Put(":id/profile") // 修改为PUT请求    
  updateProfile(@Param("id", ParseIntPipe) id: number, @Body() updateUserDto: UpdateUserDto, @Request() req) {
    return this.usersService.update(id, updateUserDto, req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(":id")
  remove(@Param("id", ParseIntPipe) id: number, @Request() req) {
    return this.usersService.remove(id, req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Post("follow/:id")
  followUser(@Param("id", ParseIntPipe) followId: number, @Request() req) {
    return this.usersService.followUser(req.user.id, followId);
  }

  @UseGuards(JwtAuthGuard)
  @Post("unfollow/:id")
  unfollowUser(@Param("id", ParseIntPipe) followId: number, @Request() req) {
    return this.usersService.unfollowUser(req.user.id, followId);
  }

  @Get(":id/followers")
  getFollowers(@Param("id", ParseIntPipe) id: number) {
    return this.usersService.getFollowers(id);
  }

  @Get(":id/following")
  getFollowing(@Param("id", ParseIntPipe) id: number) {
    return this.usersService.getFollowing(id);
  }

  @Get(":id/videos")
  getUserVideos(@Param("id", ParseIntPipe) id: number) {
    return this.usersService.getUserVideos(id);
  }

  @Get(":id/favorites")
  getUserFavorites(@Param("id", ParseIntPipe) id: number) {
    return this.usersService.getUserFavorites(id);
  }

  @UseGuards(JwtAuthGuard)
  @Get(":id/history")
  getViewHistory(@Param("id", ParseIntPipe) id: number) {
    return this.usersService.getViewHistory(id);
  }

  @UseGuards(JwtAuthGuard)
  @Put("password")
  updatePassword(@Body() updatePasswordDto: UpdatePasswordDto, @Request() req) {
    return this.usersService.updatePassword(
      req.user.id,
      updatePasswordDto.currentPassword,
      updatePasswordDto.newPassword
    );
  }
}
