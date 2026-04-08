# Sistema de Gerenciamento de Usuários - Conéctar

Sistema completo de gerenciamento de usuários desenvolvido com **NestJS** (backend) e **ReactJS** (frontend), ambos utilizando **TypeScript**.

## Tecnologias Utilizadas

### Backend
- **NestJS** com TypeScript
- **PostgreSQL** como banco de dados
- **TypeORM** para ORM
- **JWT** para autenticação
- **bcrypt** para criptografia de senhas
- **Swagger** para documentação da API
- **Jest** para testes

### Frontend
- **ReactJS** com TypeScript
- **React Router** para roteamento
- **Context API** para gerenciamento de estado
- **TailwindCSS** para estilização
- **Axios** para requisições HTTP

## Funcionalidades

### Backend
- Autenticação JWT com rotas `/auth/register` e `/auth/login`
- CRUD completo de usuários com controle de permissões
- Filtros por role e ordenação por nome/data
- Endpoint para usuários inativos (30+ dias sem login)
- Testes unitários e de integração
- Documentação Swagger
- Proteção contra SQL Injection e XSS

### Frontend
- Tela de login responsiva
- Tela de cadastro de usuários
- Dashboard para administradores
- Perfil do usuário para usuários regulares
- Interface responsiva (mobile e desktop)
- Filtros e ordenação na listagem

## Configuração e Instalação

### Pré-requisitos
- Node.js (versão 18 ou superior)
- PostgreSQL
- npm ou yarn

### 1. Clone o repositório
```bash
git clone <url-do-repositorio>
cd conectar-user-management
```

### 2. Instale as dependências
```bash
# Instalar dependências de ambos os projetos
npm run install:all

# Ou instalar separadamente
npm run backend:install
npm run frontend:install
```

### 3. Configuração do Banco de Dados

1. Crie um banco PostgreSQL:
```sql
CREATE DATABASE conectar_users;
```

2. Configure as variáveis de ambiente no backend:
```bash
cd backend
cp .env.example .env
```

3. Edite o arquivo `.env` com suas configurações:
```env
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USERNAME=seu_usuario
DATABASE_PASSWORD=sua_senha
DATABASE_NAME=conectar_users
JWT_SECRET=seu_jwt_secret_muito_seguro
JWT_EXPIRES_IN=24h
```

### 4. Execute as migrações
```bash
cd backend
npm run migration:run
```

### 5. Inicie a aplicação

#### Desenvolvimento (ambos simultaneamente)
```bash
npm run dev
```

#### Ou separadamente
```bash
# Backend (porta 3001)
npm run backend:dev

# Frontend (porta 3000)
npm run frontend:dev
```

## Documentação da API

Após iniciar o backend, acesse a documentação Swagger em:
```
http://localhost:3001/api/docs
```

## Executar Testes

```bash
# Testes do backend
npm run backend:test

# Testes com cobertura
cd backend && npm run test:cov
```

## Usuários Padrão

Após executar as migrações, os seguintes usuários estarão disponíveis:

### Administrador
- **Email**: admin@conectar.com
- **Senha**: admin123
- **Role**: admin

### Usuário Regular
- **Email**: user@conectar.com
- **Senha**: user123
- **Role**: user

## Arquitetura do Projeto

```
conectar-user-management/
├── backend/                 # API NestJS
│   ├── src/
│   │   ├── auth/           # Módulo de autenticação
│   │   ├── users/          # Módulo de usuários
│   │   ├── common/         # Utilitários e guards
│   │   └── database/       # Configuração do banco
│   ├── test/               # Testes e2e
│   └── migrations/         # Migrações do banco
├── frontend/               # Aplicação React
│   ├── src/
│   │   ├── components/     # Componentes reutilizáveis
│   │   ├── pages/          # Páginas da aplicação
│   │   ├── contexts/       # Context API
│   │   ├── services/       # Serviços HTTP
│   │   └── types/          # Tipos TypeScript
│   └── public/             # Arquivos estáticos
└── README.md
```

## Segurança

- **Autenticação JWT** com tokens seguros
- **Criptografia bcrypt** para senhas
- **Validação de entrada** em todas as rotas
- **Rate limiting** para prevenir ataques
- **CORS** configurado adequadamente
- **Sanitização** contra XSS e SQL Injection

## URLs da Aplicação

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001
- **Documentação Swagger**: http://localhost:3001/api/docs

## Contribuição

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

---

**Nota**: Este é um projeto de demonstração que implementa as melhores práticas de desenvolvimento web moderno com foco em segurança, escalabilidade e experiência do usuário.
