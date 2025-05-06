import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class UpdatePasswordDto {
  @IsNotEmpty({ message: '当前密码不能为空' })
  @IsString()
  currentPassword: string;

  @IsNotEmpty({ message: '新密码不能为空' })
  @IsString()
  @MinLength(6, { message: '新密码长度至少为6个字符' })
  newPassword: string;
} 