import {
  Injectable,
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../users/users.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { User, UserRole } from '../users/entities/user.entity';
import { OAuth2Client } from 'google-auth-library';
import { ActivitiesService } from '../activities/activities.service';

@Injectable()
export class AuthService {
  private googleClient: OAuth2Client;

  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly activitiesService: ActivitiesService, // Adicionar
  ) {
    // Configuração mais explícita do OAuth2Client
    this.googleClient = new OAuth2Client({
      clientId: this.configService.get('GOOGLE_CLIENT_ID'),
      clientSecret: this.configService.get('GOOGLE_CLIENT_SECRET'), // Opcional mas pode ajudar
    });
    
    console.log('GoogleClient inicializado com Client ID:', this.configService.get('GOOGLE_CLIENT_ID'));
  }

  async register(registerDto: RegisterDto) {
    try {
      const user = await this.usersService.create({
        ...registerDto,
        role: UserRole.USER, // Novos usuários sempre começam como USER
      });

      const { password, ...result } = user;
      return {
        message: 'Usuário criado com sucesso',
        user: result,
      };
    } catch (error) {
      if (error instanceof ConflictException) {
        throw error;
      }
      throw new ConflictException('Erro ao criar usuário');
    }
  }

  async login(loginDto: LoginDto, ipAddress?: string, userAgent?: string) {
    const user = await this.validateUser(loginDto.email, loginDto.password);
    
    if (!user) {
      throw new UnauthorizedException('Credenciais inválidas');
    }

    if (!user.isActive) {
      throw new UnauthorizedException('Conta desativada');
    }

    // Atualizar último login
    await this.usersService.updateLastLogin(user.id);

    // Log da atividade de login
    await this.activitiesService.logLogin(user.id, ipAddress, userAgent);

    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
        createdAt: user.createdAt,
        lastLoginAt: user.lastLoginAt,
      },
    };
  }

  async googleLogin(credential: string, ipAddress?: string, userAgent?: string) {
    try {
      console.log('=== VERIFICANDO TOKEN GOOGLE ===');
      console.log('Client ID configurado:', this.configService.get('GOOGLE_CLIENT_ID'));
      console.log('Token recebido (primeiros 50 chars):', credential?.substring(0, 50));
      console.log('Token length:', credential?.length);
      
      // Verificar se o googleClient foi inicializado corretamente
      console.log('GoogleClient inicializado:', !!this.googleClient);
      
      // Verificar o token do Google
      console.log('Iniciando verificação do token...');
      const ticket = await this.googleClient.verifyIdToken({
        idToken: credential,
        audience: this.configService.get('GOOGLE_CLIENT_ID'),
      });
      
      console.log('Token verificado com sucesso!');
      const payload = ticket.getPayload();
      
      if (!payload) {
        console.error('Payload vazio após verificação');
        throw new UnauthorizedException('Token do Google inválido');
      }
      
      // Extrair dados do usuário
      const googleUser = {
        email: payload.email,
        name: payload.name,
        picture: payload.picture,
        googleId: payload.sub,
      };
  
      // Validar/criar usuário
      const user = await this.validateGoogleUser(googleUser);
  
      // Gerar JWT
      const jwtPayload = {
        sub: user.id,
        email: user.email,
        role: user.role,
      };
  
      return {
        access_token: this.jwtService.sign(jwtPayload),
        user,
      };
    } catch (error) {
      console.error('Erro no login do Google:', error);
      console.error('=== ERRO DETALHADO NO GOOGLE LOGIN ===');
      console.error('Tipo do erro:', error.constructor.name);
      console.error('Mensagem:', error.message);
      console.error('Stack:', error.stack);
      
      // Se for erro específico do Google
      if (error.code) {
        console.error('Código do erro Google:', error.code);
      }
      
      throw new UnauthorizedException('Falha na autenticação com Google: ' + error.message);
    }
  }

  async validateUser(email: string, password: string): Promise<User | null> {
    const user = await this.usersService.findByEmail(email);
    if (user && await user.validatePassword(password)) {
      return user;
    }
    return null;
  }

  async validateUserById(userId: string): Promise<User | null> {
    return this.usersService.findOne(userId);
  }

  async validateGoogleUser(googleUser: any): Promise<User> {
    let user = await this.usersService.findByEmail(googleUser.email);
    
    if (!user) {
      user = await this.usersService.createGoogleUser({
        name: googleUser.name,
        email: googleUser.email,
        password: '', 
        role: UserRole.USER,
        googleId: googleUser.googleId,
        picture: googleUser.picture,
      });
    }

    await this.usersService.updateLastLogin(user.id);
    await this.activitiesService.logLogin(user.id);

    return user;
  }

  async refreshToken(user: any) {
    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
        createdAt: user.createdAt,
        lastLoginAt: user.lastLoginAt,
      },
    };
  }
}