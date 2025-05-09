import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, CreateDateColumn } from 'typeorm';
import { User } from './user.entity';
import { Video } from './video.entity';

@Entity()
export class VideoReview {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Video, video => video.reviews)
  video: Video;

  @Column()
  videoId: number;

  @ManyToOne(() => User)
  admin: User;

  @Column()
  adminId: number;

  @Column({
    type: 'enum',
    enum: ['approved', 'rejected'],
  })
  status: 'approved' | 'rejected';

  @Column({ type: 'text', nullable: true })
  reason: string;

  @CreateDateColumn()
  createdAt: Date;
} 