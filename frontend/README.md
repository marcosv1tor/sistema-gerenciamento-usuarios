# Frontend - Sistema de Gerenciamento de Usuários

Uma aplicação React moderna com TypeScript para gerenciamento de usuários, construída com as melhores práticas de desenvolvimento frontend.

## 🚀 Tecnologias Utilizadas

- **React 18** - Biblioteca para construção de interfaces
- **TypeScript** - Superset do JavaScript com tipagem estática
- **Tailwind CSS** - Framework CSS utilitário
- **React Router** - Roteamento para aplicações React
- **React Query** - Gerenciamento de estado do servidor
- **React Hook Form** - Biblioteca para formulários performáticos
- **Zod** - Validação de esquemas TypeScript-first
- **Axios** - Cliente HTTP para requisições à API
- **React Hot Toast** - Notificações elegantes
- **Heroicons** - Ícones SVG

## 📋 Pré-requisitos

- Node.js 18+ 
- npm ou yarn
- Backend da aplicação rodando (veja ../backend/README.md)

## 🛠️ Instalação

1. **Instale as dependências:**
   ```bash
   npm install
   ```

2. **Configure as variáveis de ambiente:**
   ```bash
   # Crie um arquivo .env na raiz do frontend
   echo "REACT_APP_API_URL=http://localhost:3001" > .env
   ```

3. **Inicie o servidor de desenvolvimento:**
   ```bash
   npm start
   ```

4. **Acesse a aplicação:**
   - Abra [http://localhost:3000](http://localhost:3000) no seu navegador

## 📁 Estrutura do Projeto

```
src/
├── components/          # Componentes reutilizáveis
│   ├── ui/             # Componentes de interface básicos
│   └── layout/         # Componentes de layout
├── contexts/           # Contextos React (AuthContext)
├── hooks/              # Hooks customizados
├── pages/              # Páginas da aplicação
│   ├── auth/          # Páginas de autenticação
│   └── users/         # Páginas de gerenciamento de usuários
├── services/           # Serviços de API
├── types/              # Definições de tipos TypeScript
├── utils/              # Utilitários e helpers
├── App.tsx            # Componente principal
├── index.tsx          # Ponto de entrada
└── index.css          # Estilos globais
```

## 🎯 Funcionalidades

### Autenticação
- ✅ Login com email e senha
- ✅ Registro de novos usuários
- ✅ Logout seguro
- ✅ Persistência de sessão
- ✅ Proteção de rotas

### Gerenciamento de Usuários
- ✅ Listagem paginada de usuários
- ✅ Busca e filtros
- ✅ Criação de novos usuários
- ✅ Edição de usuários existentes
- ✅ Exclusão de usuários
- ✅ Controle de acesso baseado em papéis

### Interface
- ✅ Design responsivo
- ✅ Tema moderno com Tailwind CSS
- ✅ Componentes reutilizáveis
- ✅ Notificações em tempo real
- ✅ Loading states
- ✅ Tratamento de erros

## 👥 Papéis de Usuário

### Administrador
- Acesso total ao sistema
- Pode gerenciar todos os usuários
- Pode criar administradores e gerentes

### Gerente
- Pode gerenciar usuários comuns
- Pode visualizar relatórios
- Não pode gerenciar administradores

### Usuário
- Acesso básico ao sistema
- Pode editar apenas seu próprio perfil

## 🔧 Scripts Disponíveis

```bash
# Desenvolvimento
npm start              # Inicia o servidor de desenvolvimento
npm run build          # Gera build de produção
npm test               # Executa os testes
npm run eject          # Ejeta a configuração do Create React App

# Linting e Formatação
npm run lint           # Executa o ESLint
npm run lint:fix       # Corrige problemas do ESLint automaticamente
npm run format         # Formata o código com Prettier
```

## 🌐 Variáveis de Ambiente

Crie um arquivo `.env` na raiz do projeto:

```env
# URL da API backend
REACT_APP_API_URL=http://localhost:3001

# Outras configurações opcionais
REACT_APP_APP_NAME="Sistema de Gerenciamento"
REACT_APP_VERSION="1.0.0"
```

## 📱 Responsividade

A aplicação é totalmente responsiva e funciona em:
- 📱 Dispositivos móveis (320px+)
- 📱 Tablets (768px+)
- 💻 Desktops (1024px+)
- 🖥️ Telas grandes (1280px+)

## 🎨 Customização do Tema

O tema pode ser customizado editando o arquivo `tailwind.config.js`:

```javascript
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: {
          // Suas cores personalizadas
        }
      }
    }
  }
}
```

## 🔒 Segurança

- ✅ Autenticação JWT
- ✅ Proteção de rotas
- ✅ Validação de formulários
- ✅ Sanitização de dados
- ✅ Headers de segurança
- ✅ Controle de acesso baseado em papéis

## 🚀 Deploy

### Build de Produção

```bash
npm run build
```

### Deploy com Netlify

1. Conecte seu repositório ao Netlify
2. Configure as variáveis de ambiente
3. Deploy automático a cada push

### Deploy com Vercel

```bash
npm install -g vercel
vercel
```

## 🐛 Troubleshooting

### Problemas Comuns

**Erro de CORS:**
- Verifique se o backend está configurado para aceitar requisições do frontend
- Confirme a URL da API nas variáveis de ambiente

**Erro de autenticação:**
- Verifique se o backend está rodando
- Confirme as credenciais de login
- Limpe o localStorage se necessário

**Problemas de build:**
- Limpe o cache: `npm start -- --reset-cache`
- Reinstale as dependências: `rm -rf node_modules && npm install`

## 📚 Documentação Adicional

- [React Documentation](https://reactjs.org/docs)
- [TypeScript Handbook](https://www.typescriptlang.org/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [React Query](https://react-query.tanstack.com)
- [React Hook Form](https://react-hook-form.com)

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo `LICENSE` para mais detalhes.

## 👨‍💻 Autor

Desenvolvido com ❤️ para demonstrar as melhores práticas de desenvolvimento frontend moderno.

---

**Nota:** Certifique-se de que o backend esteja rodando antes de iniciar o frontend. Para mais informações sobre o backend, consulte `../backend/README.md`.