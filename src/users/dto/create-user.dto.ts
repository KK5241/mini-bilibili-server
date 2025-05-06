import { IsNotEmpty, IsString, MinLength, MaxLength, IsOptional } from 'class-validator';

export class CreateUserDto {
  @IsNotEmpty({ message: '用户名不能为空' })
  @IsString({ message: '用户名必须是字符串' })
  @MinLength(3, { message: '用户名长度不能小于3个字符' })
  @MaxLength(20, { message: '用户名长度不能超过20个字符' })
  username: string;

  @IsNotEmpty({ message: '密码不能为空' })
  @IsString({ message: '密码必须是字符串' })
  @MinLength(6, { message: '密码长度不能小于6个字符' })
  password: string;

  @IsOptional()
  @IsString({ message: '头像必须是字符串' })
  avatar?: string;

  @IsOptional()
  @IsString({ message: '个人简介必须是字符串' })
  bio?: string;
} 