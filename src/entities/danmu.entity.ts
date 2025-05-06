import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  ManyToOne,
  JoinColumn
} from 'typeorm';
import { User } from './user.entity';
import { Video } from './video.entity';

@Entity()
export class Danmu {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('text')
  content: string;

  @Column('float')
  time: number;

  @Column({ default: 0 })
  color: number;

  @Column({ default: 0 })
  type: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column()
  userId: number;

  @ManyToOne(() => Video, video => video.danmus)
  @JoinColumn({ name: 'videoId' })
  video: Video;

  @Column()
  videoId: number;

  @CreateDateColumn()
  createdAt: Date;
} 