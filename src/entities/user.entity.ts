import { 
  Entity, 
  Column, 
  PrimaryGeneratedColumn, 
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  ManyToMany,
  JoinTable
} from 'typeorm';
import { Video } from './video.entity';
import { Comment } from './comment.entity';
import { ChatMessage } from './chat-message.entity';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 50, unique: true })
  username: string;

  @Column({ select: false })
  password: string;

  @Column({ nullable: true })
  avatar: string;

  @Column({ nullable: true })
  bio: string;

  @Column({ default: 0 })
  followers: number;

  @Column({ default: 0 })
  following: number;

  @Column({ default: 'user' })
  role: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => Video, video => video.user)
  videos: Video[];

  @OneToMany(() => Comment, comment => comment.user)
  comments: Comment[];

  @ManyToMany(() => User)
  @JoinTable({
    name: 'user_followers',
    joinColumn: { name: 'followerId', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'followingId', referencedColumnName: 'id' },
  })
  follows: User[];

  @OneToMany(() => ChatMessage, message => message.sender)
  sentMessages: ChatMessage[];

  @OneToMany(() => ChatMessage, message => message.receiver)
  receivedMessages: ChatMessage[];
} 