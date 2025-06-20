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

@Injectable()
export class AuthService {
  private googleClient: OAuth2Client;

  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {
    this.googleClient = new OAuth2Client(this.configService.get('GOOGLE_CLIENT_ID'));
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

  async login(loginDto: LoginDto) {
    const user = await this.validateUser(loginDto.email, loginDto.password);
    
    if (!user) {
      throw new UnauthorizedException('Credenciais inválidas');
    }

    if (!user.isActive) {
      throw new UnauthorizedException('Conta desativada');
    }

    // Atualizar último login
    await this.usersService.updateLastLogin(user.id);

    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    const { password, ...userWithoutPassword } = user;

    return {
      access_token: this.jwtService.sign(payload),
      user: userWithoutPassword,
      message: 'Login realizado com sucesso',
    };
  }

  async validateUser(email: string, password: string): Promise<User | null> {
    const user = await this.usersService.findByEmail(email);
    
    if (!user) {
      return null;
    }
    
    // Se o usuário não tem senha (usuário Google), não pode fazer login tradicional
    if (!user.password) {
      return null;
    }
    
    const isPasswordValid = await user.validatePassword(password);
    if (!isPasswordValid) {
      return null;
    }
    
    return user;
  }

  async validateUserById(id: string): Promise<User | null> {
    try {
      return await this.usersService.findOne(id);
    } catch {
      return null;
    }
  }

  async refreshToken(user: User) {
    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    return {
      access_token: this.jwtService.sign(payload),
      user,
    };
  }

  async validateGoogleUser(googleUser: any) {
    const { email, name, picture, googleId } = googleUser;
    
    // Verificar se o usuário já existe
    let user = await this.usersService.findByEmail(email);
    
    if (!user) {
      // Criar novo usuário se não existir
      user = await this.usersService.createGoogleUser({
        email,
        name,
        picture,
        googleId,
        role: UserRole.USER,
      });
    } else if (!user.googleId) {
      // Vincular conta Google a usuário existente
      user = await this.usersService.updateGoogleUser(user.id, {
        googleId,
        picture: picture || user.picture,
      });
    }
    
    return user;
  }

  async googleLogin(credential: string) {
    try {
      // Verificar o token do Google
      const ticket = await this.googleClient.verifyIdToken({
        idToken: credential,
        audience: this.configService.get('GOOGLE_CLIENT_ID'),
      });
  
      const payload = ticket.getPayload();
      if (!payload) {
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
      throw new UnauthorizedException('Falha na autenticação com Google');
    }
  }
}