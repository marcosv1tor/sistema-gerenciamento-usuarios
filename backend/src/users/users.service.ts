import {
  Injectable,
  NotFoundException,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThanOrEqual } from 'typeorm';
import { User, UserRole } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { QueryUserDto } from './dto/query-user.dto';
import { ActivitiesService } from '../activities/activities.service';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private activitiesService: ActivitiesService, // Adicionar
  ) {}

  async create(createUserDto: CreateUserDto, adminUser?: User): Promise<User> {
    // Verificar se o email já existe
    const existingUser = await this.userRepository.findOne({
      where: { email: createUserDto.email },
    });

    if (existingUser) {
      throw new ConflictException('Email já está em uso');
    }

    const user = this.userRepository.create(createUserDto);
    const savedUser = await this.userRepository.save(user);
    
    // Log da atividade de criação
    if (adminUser) {
      await this.activitiesService.logUserCreated(adminUser.id, savedUser.id, savedUser.name);
    }
    
    return savedUser;
  }

  async createGoogleUser(createUserDto: CreateUserDto): Promise<User> {
    // Verificar se o email já existe
    const existingUser = await this.userRepository.findOne({
      where: { email: createUserDto.email },
    });

    if (existingUser) {
      throw new ConflictException('Email já está em uso');
    }

    const user = this.userRepository.create({
      ...createUserDto,
      isActive: true, // Usuários Google são ativados automaticamente
    });
    return await this.userRepository.save(user);
  }

  async updateGoogleUser(id: string, updateData: Partial<User>): Promise<User> {
    const user = await this.findOne(id);
    Object.assign(user, updateData);
    return await this.userRepository.save(user);
  }

  async findAll(queryDto: QueryUserDto) {
    const { role, sortBy, order, page, limit, search } = queryDto;
    const skip = (page - 1) * limit;
  
    const queryBuilder = this.userRepository.createQueryBuilder('user');
  
    // Filtro por busca (nome ou email)
    if (search) {
      queryBuilder.where(
        '(user.name ILIKE :search OR user.email ILIKE :search)',
        { search: `%${search}%` }
      );
    }
  
    // Filtro por role
    if (role) {
      if (search) {
        queryBuilder.andWhere('user.role = :role', { role });
      } else {
        queryBuilder.where('user.role = :role', { role });
      }
    }

    // Ordenação
    queryBuilder.orderBy(`user.${sortBy}`, order.toUpperCase() as 'ASC' | 'DESC');

    // Paginação
    queryBuilder.skip(skip).take(limit);

    const [users, total] = await queryBuilder.getManyAndCount();

    return {
      data: users,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException('Usuário não encontrado');
    }
    return user;
  }

  async findByEmail(email: string): Promise<User | null> {
    return await this.userRepository.findOne({
      where: { email },
      select: ['id', 'email', 'password', 'name', 'role', 'isActive'],
    });
  }

  async update(
    id: string,
    updateUserDto: UpdateUserDto,
    currentUser: User,
  ): Promise<User> {
    const user = await this.findOne(id);

    // Verificar permissões: usuários só podem atualizar seus próprios dados
    if (currentUser.role !== UserRole.ADMIN && currentUser.id !== id) {
      throw new ForbiddenException(
        'Você só pode atualizar seus próprios dados',
      );
    }

    // Verificar se o email já existe (se estiver sendo alterado)
    if (updateUserDto.email && updateUserDto.email !== user.email) {
      const existingUser = await this.userRepository.findOne({
        where: { email: updateUserDto.email },
      });
      if (existingUser) {
        throw new ConflictException('Email já está em uso');
      }
    }

    // Usuários comuns não podem alterar o role
    if (currentUser.role !== UserRole.ADMIN && updateUserDto.role) {
      delete updateUserDto.role;
    }

    Object.assign(user, updateUserDto);
    const updatedUser = await this.userRepository.save({ ...user, ...updateUserDto });
    
    // Log da atividade
    if (currentUser.id === id) {
      // Usuário atualizando próprio perfil
      await this.activitiesService.logProfileUpdated(currentUser.id, updateUserDto);
    } else {
      // Admin atualizando outro usuário
      await this.activitiesService.logUserUpdated(currentUser.id, id, updatedUser.name, updateUserDto);
    }
    
    return updatedUser;
  }

  async remove(id: string, currentUser: User): Promise<void> {
    // Apenas admins podem deletar usuários
    if (currentUser.role !== UserRole.ADMIN) {
      throw new ForbiddenException('Apenas administradores podem deletar usuários');
    }

    const userToDelete = await this.findOne(id);
    await this.userRepository.remove(userToDelete);
    
    // Log da atividade
    await this.activitiesService.logUserDeleted(currentUser.id, id, userToDelete.name);
  }

  async validatePassword(plainPassword: string, hashedPassword: string): Promise<boolean> {
    const bcrypt = require('bcrypt');
    return await bcrypt.compare(plainPassword, hashedPassword);
  }

  async updateLastLogin(userId: string): Promise<void> {
    await this.userRepository.update(userId, {
      lastLoginAt: new Date(),
    });
  }

  async getUserStats() {
    const totalUsers = await this.userRepository.count();
    const activeUsers = await this.userRepository.count({
      where: { isActive: true },
    });
    const adminUsers = await this.userRepository.count({
      where: { role: UserRole.ADMIN },
    });
    const managerUsers = await this.userRepository.count({
      where: { role: UserRole.MANAGER },
    });
    const regularUsers = await this.userRepository.count({
      where: { role: UserRole.USER },
    });

    // Calcular usuários novos dos últimos 30 dias
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const newUsersThisMonth = await this.userRepository.count({
      where: {
        createdAt: MoreThanOrEqual(thirtyDaysAgo),
      },
    });

    return {
      totalUsers,
      activeUsers,
      inactiveUsers: totalUsers - activeUsers,
      adminUsers,
      regularUsers: regularUsers + managerUsers, // Somar managers com users regulares
      newUsersThisMonth,
    };
  }

  async findInactiveUsers(): Promise<User[]> {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    return await this.userRepository.find({
      where: [
        { lastLoginAt: null },
        { lastLoginAt: MoreThanOrEqual(thirtyDaysAgo) },
      ],
      select: ['id', 'name', 'email', 'createdAt', 'lastLoginAt'],
      order: { createdAt: 'DESC' },
    });
  }
}