import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { User } from '../../users/entities/user.entity';

export enum ActivityType {
  LOGIN = 'login',
  LOGOUT = 'logout',
  USER_CREATED = 'user_created',
  USER_UPDATED = 'user_updated',
  USER_DELETED = 'user_deleted',
  PROFILE_UPDATED = 'profile_updated',
  PASSWORD_CHANGED = 'password_changed',
}

@Entity('activities')
export class Activity {
  @ApiProperty({ description: 'ID único da atividade' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ description: 'Tipo da atividade', enum: ActivityType })
  @Column({ type: 'enum', enum: ActivityType })
  type: ActivityType;

  @ApiProperty({ description: 'Descrição da atividade' })
  @Column({ type: 'text' })
  description: string;

  @ApiProperty({ description: 'Detalhes adicionais da atividade' })
  @Column({ type: 'jsonb', nullable: true })
  details?: any;

  @ApiProperty({ description: 'IP do usuário' })
  @Column({ nullable: true })
  ipAddress?: string;

  @ApiProperty({ description: 'User Agent' })
  @Column({ nullable: true })
  userAgent?: string;

  @ApiProperty({ description: 'ID do usuário que executou a ação' })
  @Column('uuid')
  userId: string;

  @ApiProperty({ description: 'Usuário que executou a ação' })
  @ManyToOne(() => User, { eager: true })
  @JoinColumn({ name: 'userId' })
  user: User;

  @ApiProperty({ description: 'ID do usuário alvo (para ações em outros usuários)' })
  @Column('uuid', { nullable: true })
  targetUserId?: string;

  @ApiProperty({ description: 'Usuário alvo da ação' })
  @ManyToOne(() => User, { eager: true })
  @JoinColumn({ name: 'targetUserId' })
  targetUser?: User;

  @ApiProperty({ description: 'Data de criação da atividade' })
  @CreateDateColumn()
  createdAt: Date;
}