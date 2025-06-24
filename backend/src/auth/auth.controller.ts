import {
  Controller,
  Post,
  Body,
  UseGuards,
  Request,
  Get,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @ApiOperation({ summary: 'Registrar novo usuário' })
  @ApiResponse({
    status: 201,
    description: 'Usuário registrado com sucesso',
    schema: {
      example: {
        message: 'Usuário criado com sucesso',
        user: {
          id: 'uuid',
          name: 'João Silva',
          email: 'joao@exemplo.com',
          role: 'user',
          createdAt: '2024-01-01T00:00:00.000Z',
          updatedAt: '2024-01-01T00:00:00.000Z',
        },
      },
    },
  })
  @ApiResponse({ status: 409, description: 'Email já está em uso' })
  @ApiResponse({ status: 400, description: 'Dados inválidos' })
  register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Post('login')
  @ApiOperation({ summary: 'Fazer login' })
  @ApiResponse({
    status: 200,
    description: 'Login realizado com sucesso',
    schema: {
      example: {
        access_token: 'jwt_token_here',
        user: {
          id: 'uuid',
          name: 'João Silva',
          email: 'joao@exemplo.com',
          role: 'user',
          lastLoginAt: '2024-01-01T00:00:00.000Z',
          createdAt: '2024-01-01T00:00:00.000Z',
          updatedAt: '2024-01-01T00:00:00.000Z',
        },
        message: 'Login realizado com sucesso',
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Credenciais inválidas' })
  login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Obter dados do usuário logado' })
  @ApiResponse({
    status: 200,
    description: 'Dados do usuário retornados com sucesso',
  })
  @ApiResponse({ status: 401, description: 'Token inválido ou expirado' })
  getProfile(@Request() req) {
    return req.user;
  }

  @Post('refresh')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Renovar token de acesso' })
  @ApiResponse({
    status: 200,
    description: 'Token renovado com sucesso',
    schema: {
      example: {
        access_token: 'new_jwt_token_here',
        user: {
          id: 'uuid',
          name: 'João Silva',
          email: 'joao@exemplo.com',
          role: 'user',
        },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Token inválido ou expirado' })
  refreshToken(@Request() req) {
    return this.authService.refreshToken(req.user);
  }

  @Post('google/verify')
  @ApiOperation({ summary: 'Verificar token do Google e fazer login' })
  @ApiResponse({
    status: 200,
    description: 'Login com Google realizado com sucesso',
    schema: {
      example: {
        access_token: 'jwt_token_here',
        user: {
          id: 'uuid',
          name: 'João Silva',
          email: 'joao@exemplo.com',
          role: 'user',
          googleId: 'google_user_id',
          picture: 'https://...',
        },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Token do Google inválido' })
  async googleLogin(@Body() body: { credential: string }) {
    console.log('=== CONTROLLER GOOGLE LOGIN ===');
    console.log('Body recebido:', body);
    console.log('Credential no body:', body?.credential?.substring(0, 50));
    
    return this.authService.googleLogin(body.credential);
  }
}