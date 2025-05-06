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
export class ViewHistory {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  userId: number;

  @Column()
  videoId: number;

  @Column({ default: 1 })
  viewCount: number;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @ManyToOne(() => Video, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'videoId' })
  video: Video;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  watchedAt: Date;
} 