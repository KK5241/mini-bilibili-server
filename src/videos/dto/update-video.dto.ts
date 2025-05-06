import { IsString, IsOptional, IsBoolean, IsUrl } from 'class-validator';

export class UpdateVideoDto {
  @IsOptional()
  @IsString({ message: '标题必须是字符串' })
  title?: string;

  @IsOptional()
  @IsString({ message: '描述必须是字符串' })
  description?: string;

  @IsOptional()
  @IsString({ message: '封面图必须是字符串' })
  cover?: string;

  @IsOptional()
  @IsString({ message: '视频地址必须是字符串' })
  @IsUrl({}, { message: '视频地址必须是有效的URL' })
  videoUrl?: string;

  @IsOptional()
  @IsString({ message: '时长必须是字符串' })
  duration?: string;

  @IsOptional()
  @IsBoolean({ message: '是否精品课程必须是布尔值' })
  isPremium?: boolean;

  @IsOptional()
  @IsBoolean({ message: '是否智慧课程必须是布尔值' })
  hasWisdomCourse?: boolean;

  @IsOptional()
  @IsString({ message: '教师姓名必须是字符串' })
  teacher?: string;
} 