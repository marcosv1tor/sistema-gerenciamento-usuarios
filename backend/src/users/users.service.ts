import {
  Injectable,
  NotFoundException,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThanOrEqual } from 'typeorm'; // Adicionar MoreThanOrEqual
import { User, UserRole } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { QueryUserDto } from './dto/query-user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    // Verificar se o email já existe
    const existingUser = await this.userRepository.findOne({
      where: { email: createUserDto.email },
    });

    if (existingUser) {
      throw new ConflictException('Email já está em uso');
    }

    const user = this.userRepository.create(createUserDto);
    return await this.userRepository.save(user);
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
    return await this.userRepository.save(user);
  }

  async remove(id: string, currentUser: User): Promise<void> {
    // Apenas admins podem deletar usuários
    if (currentUser.role !== UserRole.ADMIN) {
      throw new ForbiddenException('Apenas administradores podem deletar usuários');
    }

    const user = await this.findOne(id);
    
    // Não permitir que admin delete a si mesmo
    if (user.id === currentUser.id) {
      throw new ForbiddenException('Você não pode deletar sua própria conta');
    }

    await this.userRepository.remove(user);
  }

  async updateLastLogin(id: string): Promise<void> {
    await this.userRepository.update(id, {
      lastLoginAt: new Date(),
    });
  }

  async findInactiveUsers(): Promise<User[]> {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    return await this.userRepository
      .createQueryBuilder('user')
      .where(
        '(user.lastLoginAt IS NULL OR user.lastLoginAt < :thirtyDaysAgo)',
        { thirtyDaysAgo },
      )
      .getMany();
  }

  async getUserStats() {
    const totalUsers = await this.userRepository.count();
    const activeUsers = await this.userRepository.count({
      where: { isActive: true },
    });
    const adminUsers = await this.userRepository.count({
      where: { role: UserRole.ADMIN },
    });
    const regularUsers = await this.userRepository.count({
      where: { role: UserRole.USER },
    });
    
    // Calcular novos usuários do mês atual
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);
    
    const newUsersThisMonth = await this.userRepository.count({
      where: {
        createdAt: MoreThanOrEqual(startOfMonth),
      },
    });

    return {
      totalUsers,
      activeUsers,
      inactiveUsers: totalUsers - activeUsers,
      adminUsers,
      regularUsers,
      newUsersThisMonth,
    };
  }
}