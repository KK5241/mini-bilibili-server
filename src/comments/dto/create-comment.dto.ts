import { IsNotEmpty, IsString, IsInt, IsOptional } from 'class-validator';

export class CreateCommentDto {
  @IsNotEmpty({ message: '评论内容不能为空' })
  @IsString({ message: '评论内容必须是字符串' })
  content: string;

  @IsNotEmpty({ message: '视频ID不能为空' })
  @IsInt({ message: '视频ID必须是整数' })
  videoId: number;

  @IsOptional()
  @IsInt({ message: '父评论ID必须是整数' })
  parentId?: number;
} 