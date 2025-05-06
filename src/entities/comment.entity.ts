import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany
} from 'typeorm';
import { User } from './user.entity';
import { Video } from './video.entity';

@Entity()
export class Comment {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('text')
  content: string;

  @Column({ default: 0 })
  likes: number;

  @ManyToOne(() => User, user => user.comments)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column()
  userId: number;

  @ManyToOne(() => Video, video => video.comments)
  @JoinColumn({ name: 'videoId' })
  video: Video;

  @Column()
  videoId: number;

  @Column({ nullable: true })
  parentId: number;

  @OneToMany(() => Comment, comment => comment.parentId)
  replayComments: Comment[];
  
  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
} 