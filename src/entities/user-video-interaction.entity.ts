import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Unique
} from 'typeorm';
import { User } from './user.entity';
import { Video } from './video.entity';

@Entity()
@Unique(['userId', 'videoId'])
export class UserVideoInteraction {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  userId: number;

  @Column()
  videoId: number;

  @Column({ default: false })
  liked: boolean;

  @Column({ default: false })
  favorited: boolean;

  @Column({ default: false })
  shared: boolean;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;

  @ManyToOne(() => Video)
  @JoinColumn({ name: 'videoId' })
  video: Video;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
} 