import { 
  Entity, 
  PrimaryGeneratedColumn, 
  Column, 
  CreateDateColumn, 
  UpdateDateColumn,
  ManyToOne,
  JoinColumn 
} from 'typeorm';
import { User } from './user.entity';

@Entity()
export class ChatMessage {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  senderId: number;

  @Column()
  receiverId: number;

  @Column('text')
  content: string;

  @Column({ default: false })
  isRead: boolean;
  
  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // 关联发送者
  @ManyToOne(() => User, user => user.sentMessages)
  @JoinColumn({ name: 'senderId' })
  sender: User;

  // 关联接收者
  @ManyToOne(() => User, user => user.receivedMessages)
  @JoinColumn({ name: 'receiverId' })
  receiver: User;
} 