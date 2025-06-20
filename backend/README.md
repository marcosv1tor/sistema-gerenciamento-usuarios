# Backend API - Sistema de Gerenciamento de Usuários

Este é um backend desenvolvido com NestJS que fornece uma API completa para autenticação e gerenciamento de usuários.

## Funcionalidades

- ✅ Autenticação JWT
- ✅ Registro e login de usuários
- ✅ Gerenciamento de perfis de usuário
- ✅ Sistema de roles (Admin/User)
- ✅ CRUD completo de usuários
- ✅ Validação de dados
- ✅ Documentação Swagger
- ✅ Testes unitários
- ✅ Filtros de exceção globais
- ✅ Interceptadores de resposta

## Tecnologias Utilizadas

- **NestJS** - Framework Node.js
- **TypeORM** - ORM para banco de dados
- **PostgreSQL** - Banco de dados
- **JWT** - Autenticação
- **Bcrypt** - Hash de senhas
- **Swagger** - Documentação da API
- **Jest** - Testes
- **Class Validator** - Validação de dados

## Pré-requisitos

- Node.js (versão 18 ou superior)
- PostgreSQL
- npm ou yarn

## Instalação

1. Clone o repositório:
```bash
git clone <repository-url>
cd backend
```

2. Instale as dependências:
```bash
npm install
```

3. Configure as variáveis de ambiente:
```bash
cp .env.example .env
```

Edite o arquivo `.env` com suas configurações:
```env
# Database
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=password
DB_NAME=conectar_db

# JWT
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=24h

# Application
PORT=3000
NODE_ENV=development

# CORS
FRONTEND_URL=http://localhost:3001
```

4. Configure o banco de dados PostgreSQL e crie a database:
```sql
CREATE DATABASE conectar_db;
```

## Executando a Aplicação

### Desenvolvimento
```bash
npm run start:dev
```

### Produção
```bash
npm run build
npm run start:prod
```

### Populando o banco com dados iniciais
```bash
npm run seed
```

Este comando criará usuários padrão:
- **Admin**: admin@example.com / admin123
- **Usuário**: user@example.com / user123
- **Usuário Inativo**: inactive@example.com / inactive123

## Testes

### Executar todos os testes
```bash
npm test
```

### Executar testes em modo watch
```bash
npm run test:watch
```

### Executar testes com coverage
```bash
npm run test:cov
```

## Documentação da API

Após iniciar a aplicação, a documentação Swagger estará disponível em:
```
http://localhost:3000/api/docs
```

## Estrutura do Projeto

```
src/
├── auth/                 # Módulo de autenticação
│   ├── decorators/       # Decorators customizados
│   ├── dto/             # Data Transfer Objects
│   ├── guards/          # Guards de autenticação
│   ├── strategies/      # Estratégias do Passport
│   ├── auth.controller.ts
│   ├── auth.service.ts
│   └── auth.module.ts
├── users/               # Módulo de usuários
│   ├── dto/            # Data Transfer Objects
│   ├── entities/       # Entidades do banco
│   ├── users.controller.ts
│   ├── users.service.ts
│   └── users.module.ts
├── database/           # Configuração do banco
│   └── database.module.ts
├── common/             # Recursos compartilhados
│   ├── filters/        # Filtros de exceção
│   └── interceptors/   # Interceptadores
├── app.module.ts       # Módulo principal
├── main.ts            # Arquivo de entrada
└── seed.ts            # Script de população do banco
```

## Endpoints Principais

### Autenticação
- `POST /auth/register` - Registrar novo usuário
- `POST /auth/login` - Login
- `GET /auth/profile` - Obter perfil do usuário logado
- `POST /auth/refresh` - Renovar token

### Usuários
- `GET /users` - Listar usuários (paginado)
- `GET /users/:id` - Obter usuário por ID
- `PUT /users/:id` - Atualizar usuário
- `DELETE /users/:id` - Remover usuário
- `GET /users/stats` - Estatísticas de usuários
- `GET /users/inactive` - Usuários inativos

## Variáveis de Ambiente

| Variável | Descrição | Padrão |
|----------|-----------|--------|
| `DB_HOST` | Host do banco PostgreSQL | `localhost` |
| `DB_PORT` | Porta do banco PostgreSQL | `5432` |
| `DB_USERNAME` | Usuário do banco | `postgres` |
| `DB_PASSWORD` | Senha do banco | `password` |
| `DB_NAME` | Nome da database | `conectar_db` |
| `JWT_SECRET` | Chave secreta do JWT | `your-secret-key` |
| `JWT_EXPIRES_IN` | Tempo de expiração do token | `24h` |
| `PORT` | Porta da aplicação | `3000` |
| `NODE_ENV` | Ambiente de execução | `development` |
| `FRONTEND_URL` | URL do frontend para CORS | `http://localhost:3001` |

## Contribuição

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.