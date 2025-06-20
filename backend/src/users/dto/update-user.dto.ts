import { PartialType } from '@nestjs/swagger';
import { CreateUserDto } from './create-user.dto';
import { IsOptional, IsString, MinLength, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateUserDto extends PartialType(CreateUserDto) {
  @ApiProperty({
    description: 'Nome completo do usuário',
    example: 'João Silva Santos',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MinLength(2, { message: 'Nome deve ter pelo menos 2 caracteres' })
  @MaxLength(255, { message: 'Nome deve ter no máximo 255 caracteres' })
  name?: string;

  @ApiProperty({
    description: 'Nova senha do usuário',
    example: 'novasenha123',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MinLength(6, { message: 'Senha deve ter pelo menos 6 caracteres' })
  password?: string;

  @ApiProperty({
    description: 'Senha atual do usuário (necessária para alterar a senha)',
    example: 'senhaatual123',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MinLength(6, { message: 'Senha atual deve ter pelo menos 6 caracteres' })
  currentPassword?: string;
}