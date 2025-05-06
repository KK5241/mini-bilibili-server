import { 
  Entity, 
  PrimaryGeneratedColumn, 
  Column, 
  CreateDateColumn, 
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Unique
} from 'typeorm';
import { User } from './user.entity';

@Entity()
@Unique(['user1Id', 'user2Id'])
export class ChatConversation {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  user1Id: number;

  @Column()
  user2Id: number;

  @Column({ nullable: true })
  lastMessageId: number;

  @Column({ default: 0 })
  user1UnreadCount: number;

  @Column({ default: 0 })
  user2UnreadCount: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // 关联用户1
  @ManyToOne(() => User)
  @JoinColumn({ name: 'user1Id' })
  user1: User;

  // 关联用户2
  @ManyToOne(() => User)
  @JoinColumn({ name: 'user2Id' })
  user2: User;
} 