import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn
} from 'typeorm';
import { User } from './user.entity';
import { Comment } from './comment.entity';
import { Danmu } from './danmu.entity';
import { VideoReview } from './video-review.entity';

@Entity()
export class Video {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column({ nullable: true })
  description: string;

  @Column()
  cover: string;

  @Column()
  videoUrl: string;

  @Column({ nullable: true })
  duration: string;

  @Column({ default: 0 })
  views: number;

  @Column({ default: 0 })
  likes: number;

  @Column({ default: 0 })
  favorites: number;

  @Column({ default: 0 })
  shares: number;

  @Column({ default: false })
  isPremium: boolean;

  @Column({ default: true })
  status: boolean;

  @Column({ default: false })
  hasWisdomCourse: boolean;

  @Column({ nullable: true })
  teacher: string;

  @ManyToOne(() => User, user => user.videos)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column()
  userId: number;

  @Column({
    type: 'enum',
    enum: ['文学', '理学', '计算机', '英语', '金融', '农学', '建筑学'],
    default: '计算机'
  })
  category: string;

  @OneToMany(() => Comment, comment => comment.video)
  comments: Comment[];

  @OneToMany(() => Danmu, danmu => danmu.video)
  danmus: Danmu[];

  @Column({
    type: 'enum',
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  })
  reviewStatus: 'pending' | 'approved' | 'rejected';

  @OneToMany(() => VideoReview, review => review.video)
  reviews: VideoReview[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
} 