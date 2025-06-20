import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { User, UserRole } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { QueryUserDto } from './dto/query-user.dto';

describe('UsersController', () => {
  let controller: UsersController;
  let service: UsersService;

  const mockUser: User = {
    id: '1',
    name: 'Test User',
    email: 'test@example.com',
    role: UserRole.USER,
    isActive: true,
    lastLoginAt: new Date(),
    createdAt: new Date(),
    updatedAt: new Date(),
    password: 'hashedPassword',
    googleId: null,
    picture: null,
    hashPassword: jest.fn(),
    validatePassword: jest.fn(),
    isInactive: jest.fn(),
  };

  const mockAdmin: User = {
    ...mockUser,
    id: '2',
    email: 'admin@example.com',
    role: UserRole.ADMIN,
    googleId: null,
    picture: null,
    hashPassword: jest.fn(),
    validatePassword: jest.fn(),
    isInactive: jest.fn(),
  };

  const mockUsersService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    updateLastLogin: jest.fn(),
    findInactiveUsers: jest.fn(),
    getUserStats: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
    service = module.get<UsersService>(UsersService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a new user', async () => {
      const createUserDto: CreateUserDto = {
        name: 'New User',
        email: 'new@example.com',
        password: 'password123',
      };

      mockUsersService.create.mockResolvedValue(mockUser);

      const result = await controller.create(createUserDto);

      expect(service.create).toHaveBeenCalledWith(createUserDto);
      expect(result).toEqual(mockUser);
    });
  });

  describe('findAll', () => {
    it('should return paginated users', async () => {
      const queryDto: QueryUserDto = {
        page: 1,
        limit: 10,
      };

      const paginatedResult = {
        data: [mockUser],
        meta: {
          total: 1,
          page: 1,
          limit: 10,
          totalPages: 1,
        },
      };

      mockUsersService.findAll.mockResolvedValue(paginatedResult);

      const result = await controller.findAll(queryDto);

      expect(service.findAll).toHaveBeenCalledWith(queryDto);
      expect(result).toEqual(paginatedResult);
    });
  });

  describe('findOne', () => {
    it('should return a user by id', async () => {
      mockUsersService.findOne.mockResolvedValue(mockUser);

      const mockReq = { user: mockAdmin };
      const result = await controller.findOne('1', mockReq);

      expect(service.findOne).toHaveBeenCalledWith('1');
      expect(result).toEqual(mockUser);
    });
  });

  describe('getProfile', () => {
    it('should return current user profile', async () => {
      const result = await controller.getProfile(mockUser);

      expect(result).toEqual(mockUser);
    });
  });

  describe('updateProfile', () => {
    it('should update current user profile', async () => {
      const updateUserDto: UpdateUserDto = {
        name: 'Updated Name',
      };

      const updatedUser = { ...mockUser, name: 'Updated Name' };
      mockUsersService.update.mockResolvedValue(updatedUser);

      const result = await controller.updateProfile(updateUserDto, mockUser);

      expect(service.update).toHaveBeenCalledWith(
        mockUser.id,
        updateUserDto,
        mockUser,
      );
      expect(result).toEqual(updatedUser);
    });
  });

  describe('update', () => {
    it('should update user by id', async () => {
      const updateUserDto: UpdateUserDto = {
        name: 'Updated Name',
      };

      const updatedUser = { ...mockUser, name: 'Updated Name' };
      mockUsersService.update.mockResolvedValue(updatedUser);

      const result = await controller.update('1', updateUserDto, mockAdmin);

      expect(service.update).toHaveBeenCalledWith('1', updateUserDto, mockAdmin);
      expect(result).toEqual(updatedUser);
    });
  });

  describe('remove', () => {
    it('should remove user by id', async () => {
      mockUsersService.remove.mockResolvedValue(undefined);

      await controller.remove('1', mockAdmin);

      expect(service.remove).toHaveBeenCalledWith('1', mockAdmin);
    });
  });

  describe('getStats', () => {
    it('should return user statistics', async () => {
      const stats = {
        totalUsers: 10,
        activeUsers: 8,
        inactiveUsers: 2,
        adminUsers: 1,
        regularUsers: 9,
      };

      mockUsersService.getUserStats.mockResolvedValue(stats);

    const result = await controller.getStats();

    expect(service.getUserStats).toHaveBeenCalled();
      expect(result).toEqual(stats);
    });
  });

  describe('getInactiveUsers', () => {
    it('should return inactive users', async () => {
      const inactiveUsers = [mockUser];
      mockUsersService.findInactiveUsers.mockResolvedValue(inactiveUsers);

      const result = await controller.findInactiveUsers();

      expect(service.findInactiveUsers).toHaveBeenCalled();
      expect(result).toEqual(inactiveUsers);
    });
  });
});