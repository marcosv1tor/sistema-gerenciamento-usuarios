import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User, UserRole } from '../../users/entities/user.entity';

const dataSource = new DataSource({
  type: 'postgres',
  host: process.env.DATABASE_HOST || 'localhost',
  port: parseInt(process.env.DATABASE_PORT) || 5432,
  username: process.env.DATABASE_USERNAME || 'postgres',
  password: process.env.DATABASE_PASSWORD || 'password',
  database: process.env.DATABASE_NAME || 'conectar_users',
  entities: [User],
  synchronize: false,
});

async function seed() {
  try {
    await dataSource.initialize();
    console.log('🔗 Conectado ao banco de dados');

    const userRepository = dataSource.getRepository(User);

    // Verificar se já existem usuários
    const existingUsers = await userRepository.count();
    if (existingUsers > 0) {
      console.log('⚠️  Usuários já existem no banco. Seed cancelado.');
      return;
    }

    // Criar usuário administrador
    const adminPassword = await bcrypt.hash('admin123', 12);
    const admin = userRepository.create({
      name: 'Administrador Conéctar',
      email: 'admin@conectar.com',
      password: adminPassword,
      role: UserRole.ADMIN,
      isActive: true,
      lastLoginAt: new Date(),
    });

    // Criar usuário regular
    const userPassword = await bcrypt.hash('user123', 12);
    const user = userRepository.create({
      name: 'Usuário Teste',
      email: 'user@conectar.com',
      password: userPassword,
      role: UserRole.USER,
      isActive: true,
      lastLoginAt: new Date(),
    });

    // Criar usuário inativo para teste
    const inactiveUserPassword = await bcrypt.hash('inactive123', 12);
    const inactiveUser = userRepository.create({
      name: 'Usuário Inativo',
      email: 'inactive@conectar.com',
      password: inactiveUserPassword,
      role: UserRole.USER,
      isActive: true,
      lastLoginAt: new Date('2023-01-01'), // Login há mais de 30 dias
    });

    await userRepository.save([admin, user, inactiveUser]);

    console.log('✅ Seed executado com sucesso!');
    console.log('\n👤 Usuários criados:');
    console.log('📧 Admin: admin@conectar.com | 🔑 Senha: admin123');
    console.log('📧 User: user@conectar.com | 🔑 Senha: user123');
    console.log('📧 Inactive: inactive@conectar.com | 🔑 Senha: inactive123');
    console.log('\n🚀 Agora você pode fazer login na aplicação!');
  } catch (error) {
    console.error('❌ Erro ao executar seed:', error);
  } finally {
    await dataSource.destroy();
  }
}

seed();