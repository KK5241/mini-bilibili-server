import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Comment } from "../entities/comment.entity";
import { CreateCommentDto } from "./dto/create-comment.dto";

@Injectable()
export class CommentsService {
  constructor(
    @InjectRepository(Comment)
    private commentsRepository: Repository<Comment>
  ) {}

  async findByVideoId(videoId: number): Promise<Comment[]> {
    const result = await this.commentsRepository.find({
      where: { videoId },
      relations: ["user"],
      order: {
        createdAt: "DESC",
      },
    });

    const commentMap = {};
    const root = [];

    result.forEach((row) => {
      row.replayComments = [];
      commentMap[row.id] = row;
    });

    result.forEach((row) => {
      if (row.parentId == null) {
        root.push(row);
      } else if(commentMap[row.parentId]){
        commentMap[row.parentId].replayComments.push(row);
      }
      // console.log(commentMap);
      
    });
    return root;
  }

  async create(
    createCommentDto: CreateCommentDto,
    userId: number
  ): Promise<Comment> {
    const comment = this.commentsRepository.create({
      ...createCommentDto,
      userId,
    });

    return this.commentsRepository.save(comment);
  }

  async remove(id: number, userId: number): Promise<void> {
    const comment = await this.commentsRepository.findOne({
      where: { id },
      relations: ["user"],
    });

    if (!comment) {
      throw new NotFoundException(`评论ID ${id} 不存在`);
    }

    if (comment.userId !== userId) {
      throw new ForbiddenException("您只能删除自己的评论");
    }

    await this.commentsRepository.remove(comment);
  }

  async likeComment(id: number): Promise<Comment> {
    const comment = await this.commentsRepository.findOne({
      where: { id },
    });

    if (!comment) {
      throw new NotFoundException(`评论ID ${id} 不存在`);
    }

    comment.likes += 1;
    return this.commentsRepository.save(comment);
  }
}
