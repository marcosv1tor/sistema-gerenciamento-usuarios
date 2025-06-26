import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { User } from '../users/entities/user.entity';
import { Activity } from '../activities/entities/activity.entity';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => {
        const databaseUrl = configService.get('DATABASE_URL');
        
        if (databaseUrl) {
          // Usar DATABASE_URL (Railway/Produção)
          return {
            type: 'postgres',
            url: databaseUrl,
            entities: [User, Activity],
            synchronize: true, // Mudança aqui - sempre true
            logging: configService.get('NODE_ENV') === 'development',
            ssl: configService.get('NODE_ENV') === 'production' ? { rejectUnauthorized: false } : false,
            timezone: 'America/Sao_Paulo', // Adicionar esta linha
        extra: {
          timezone: 'America/Sao_Paulo', // Adicionar esta linha também
        },
          };
        } else {
          // Usar variáveis individuais (Desenvolvimento local)
          return {
            type: 'postgres',
            host: configService.get('DATABASE_HOST'),
            port: +configService.get('DATABASE_PORT'),
            username: configService.get('DATABASE_USERNAME'),
            password: configService.get('DATABASE_PASSWORD'),
            database: configService.get('DATABASE_NAME'),
            entities: [User, Activity],
            synchronize: configService.get('NODE_ENV') === 'development',
            logging: configService.get('NODE_ENV') === 'development',
          };
        }
      },
      inject: [ConfigService],
    }),
  ],
})
export class DatabaseModule {}
