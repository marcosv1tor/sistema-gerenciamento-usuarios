import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsEnum, IsIn } from 'class-validator';
import { Transform } from 'class-transformer';
import { UserRole } from '../entities/user.entity';

export class QueryUserDto {
  @ApiProperty({
    description: 'Filtrar por papel do usuário',
    enum: UserRole,
    required: false,
  })
  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole;

  @ApiProperty({
    description: 'Campo para ordenação',
    enum: ['name', 'createdAt', 'email'],
    required: false,
    default: 'createdAt',
  })
  @IsOptional()
  @IsIn(['name', 'createdAt', 'email'])
  sortBy?: string = 'createdAt';

  @ApiProperty({
    description: 'Ordem da ordenação',
    enum: ['asc', 'desc'],
    required: false,
    default: 'desc',
  })
  @IsOptional()
  @IsIn(['asc', 'desc'])
  order?: 'asc' | 'desc' = 'desc';

  @ApiProperty({
    description: 'Página para paginação',
    required: false,
    default: 1,
  })
  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  page?: number = 1;

  @ApiProperty({
    description: 'Limite de itens por página',
    required: false,
    default: 10,
  })
  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  limit?: number = 10;
}