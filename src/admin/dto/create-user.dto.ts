import { IsString, IsNotEmpty, MinLength, MaxLength, IsEnum, IsOptional } from 'class-validator';

export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(20)
  username: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  @MaxLength(20)
  password: string;

  @IsEnum(['user', 'admin'], { message: '角色必须是 user 或 admin' })
  role: 'user' | 'admin';

  @IsOptional()
  @IsString()
  bio?: string;
} 