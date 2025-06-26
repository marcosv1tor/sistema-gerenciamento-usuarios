import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Activity, ActivityType } from './entities/activity.entity';
import { QueryActivityDto } from './dto/query-activity.dto';
import { UserRole } from '../users/entities/user.entity';

export interface CreateActivityData {
  type: ActivityType;
  description: string;
  userId: string;
  targetUserId?: string;
  details?: any;
  ipAddress?: string;
  userAgent?: string;
}

@Injectable()
export class ActivitiesService {
  constructor(
    @InjectRepository(Activity)
    private activityRepository: Repository<Activity>,
  ) {}

  async create(data: CreateActivityData): Promise<Activity> {
    const activity = this.activityRepository.create(data);
    return await this.activityRepository.save(activity);
  }

  async findAll(query: QueryActivityDto, userRole: UserRole, currentUserId: string) {
    const { type, userId, startDate, endDate, page = 1, limit = 20 } = query;
    
    const queryBuilder = this.activityRepository
      .createQueryBuilder('activity')
      .leftJoinAndSelect('activity.user', 'user')
      .leftJoinAndSelect('activity.targetUser', 'targetUser')
      .orderBy('activity.createdAt', 'DESC');

    // Filtros baseados na role
    if (userRole === UserRole.MANAGER) {
      // Managers só veem atividades de login
      queryBuilder.where('activity.type IN (:...loginTypes)', {
        loginTypes: [ActivityType.LOGIN, ActivityType.LOGOUT]
      });
    } else if (userRole === UserRole.USER) {
      // Users não veem atividades (retorna vazio)
      queryBuilder.where('1 = 0');
    }
    // ADMINs veem todas as atividades (sem filtro adicional)

    // Filtros opcionais
    if (type) {
      queryBuilder.andWhere('activity.type = :type', { type });
    }

    if (userId) {
      queryBuilder.andWhere('activity.userId = :userId', { userId });
    }

    if (startDate) {
      queryBuilder.andWhere('activity.createdAt >= :startDate', { startDate });
    }

    if (endDate) {
      queryBuilder.andWhere('activity.createdAt <= :endDate', { endDate });
    }

    // Paginação
    const skip = (page - 1) * limit;
    queryBuilder.skip(skip).take(limit);

    const [activities, total] = await queryBuilder.getManyAndCount();

    return {
      data: activities,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  // Métodos helper para criar atividades específicas
  async logLogin(userId: string, ipAddress?: string, userAgent?: string) {
    return this.create({
      type: ActivityType.LOGIN,
      description: 'Usuário fez login no sistema',
      userId,
      ipAddress,
      userAgent,
    });
  }

  async logLogout(userId: string, ipAddress?: string, userAgent?: string) {
    return this.create({
      type: ActivityType.LOGOUT,
      description: 'Usuário fez logout do sistema',
      userId,
      ipAddress,
      userAgent,
    });
  }

  async logUserCreated(adminId: string, targetUserId: string, targetUserName: string) {
    return this.create({
      type: ActivityType.USER_CREATED,
      description: `Novo usuário criado: ${targetUserName}`,
      userId: adminId,
      targetUserId,
    });
  }

  async logUserUpdated(adminId: string, targetUserId: string, targetUserName: string, changes: any) {
    return this.create({
      type: ActivityType.USER_UPDATED,
      description: `Usuário atualizado: ${targetUserName}`,
      userId: adminId,
      targetUserId,
      details: { changes },
    });
  }

  async logUserDeleted(adminId: string, targetUserId: string, targetUserName: string) {
    return this.create({
      type: ActivityType.USER_DELETED,
      description: `Usuário deletado: ${targetUserName}`,
      userId: adminId,
      targetUserId,
    });
  }

  async logProfileUpdated(userId: string, changes: any) {
    return this.create({
      type: ActivityType.PROFILE_UPDATED,
      description: 'Perfil atualizado',
      userId,
      details: { changes },
    });
  }
}