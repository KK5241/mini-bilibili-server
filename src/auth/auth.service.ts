import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async validateUser(username: string, password: string): Promise<any> {
    const user = await this.usersService.findByUsername(username);
    
    if (user && await bcrypt.compare(password, user.password)) {
      const { password, ...result } = user;
      return result;
    }
    
    return null;
  }

  async login(user: any) {
    const payload = { username: user.username, sub: user.id, role: user.role };
    
    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        username: user.username,
        role: user.role
      }
    };
  }

  async register(username: string, password: string, avatar?: string, bio?: string) {
    // 检查用户名是否已存在
    const existingUser = await this.usersService.findByUsername(username);
    if (existingUser) {
      throw new UnauthorizedException('用户名已被使用');
    }
    
    // 创建新用户
    const newUser = await this.usersService.create({ 
      username, 
      password,
      avatar,
      bio 
    });
    
    // 返回登录信息
    return this.login(newUser);
  }
} 