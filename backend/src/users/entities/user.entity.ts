import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  BeforeInsert,
  BeforeUpdate,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import * as bcrypt from 'bcrypt';

export enum UserRole {
  ADMIN = 'admin',
  MANAGER = 'manager',
  USER = 'user',
}

@Entity('users')
export class User {
  @ApiProperty({ description: 'ID único do usuário' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ description: 'Nome completo do usuário' })
  @Column({ length: 255 })
  name: string;

  @ApiProperty({ description: 'Email do usuário (único)' })
  @Column({ unique: true, length: 255 })
  email: string;

  @Column({ length: 255, select: false, nullable: true })
  password: string;

  @ApiProperty({ description: 'Papel do usuário', enum: UserRole })
  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.USER,
  })
  role: UserRole;

  @ApiProperty({ description: 'Data do último login' })
  @Column({ type: 'timestamp', nullable: true })
  lastLoginAt: Date;

  @ApiProperty({ description: 'Indica se o usuário está ativo' })
  @Column({ default: true })
  isActive: boolean;

  @ApiProperty({ description: 'Data de criação do usuário' })
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty({ description: 'Data da última atualização' })
  @UpdateDateColumn()
  updatedAt: Date;

  @BeforeInsert()
  @BeforeUpdate()
  async hashPassword() {
    // Só fazer hash se a senha existir e não estiver vazia
    if (this.password && this.password.trim() !== '') {
      const salt = await bcrypt.genSalt(12);
      this.password = await bcrypt.hash(this.password, salt);
    }
  }

  async validatePassword(password: string): Promise<boolean> {
    // Se não há senha definida (usuário Google), retornar false
    if (!this.password) {
      return false;
    }
    return bcrypt.compare(password, this.password);
  }

  // Método para verificar se o usuário está inativo (sem login há mais de 30 dias)
  isInactive(): boolean {
    if (!this.lastLoginAt) return true;
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    return this.lastLoginAt < thirtyDaysAgo;
  }

  @Column({ nullable: true })
  googleId: string;

  @Column({ nullable: true })
  picture: string;
}