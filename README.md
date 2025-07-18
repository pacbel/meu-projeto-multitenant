# Sistema Multitenant com Next.js e TypeScript

## Sobre o Projeto

Este é um sistema de demonstração que implementa uma arquitetura multitenant usando Next.js e TypeScript. O sistema permite que diferentes clientes (tenants) acessem suas próprias informações e dados isolados através de subdomínios específicos, enquanto compartilham a mesma base de código.

## Características Principais

- **Arquitetura Multitenant**: Isolamento de dados por cliente através de subdomínios
- **Autenticação Simples**: Login baseado apenas em e-mail para fins de demonstração
- **API REST**: Endpoints para gerenciamento de usuários e posts
- **TypeScript**: Código totalmente tipado para melhor manutenção
- **Banco de Dados Isolados**: Cada tenant possui seu próprio banco de dados MySQL

## Requisitos

- Node.js 18.x ou superior
- MySQL 8.0 ou superior
- NPM ou Yarn

## Configuração do Ambiente

### 1. Instalação de Dependências

```bash
npm install
# ou
yarn install
```

### 2. Configuração do Banco de Dados

O sistema utiliza múltiplos bancos de dados MySQL, um para cada tenant. Os dumps dos bancos estão disponíveis na pasta `database/dumps/`.

#### Importação Automática (Windows)

1. Certifique-se de que o MySQL está instalado e acessível via linha de comando
2. Execute o script de importação:

```bash
cd database
importar_bancos.bat
```

#### Importação Manual

1. Crie os bancos de dados necessários:

```sql
CREATE DATABASE default_db;
CREATE DATABASE cliente1_db;
CREATE DATABASE cliente2_db;
CREATE DATABASE cliente3_db; -- opcional, estrutura vazia
```

2. Importe os dumps para cada banco:

```bash
mysql -u root default_db < database/dumps/default_db.sql
mysql -u root cliente1_db < database/dumps/cliente1_db.sql
mysql -u root cliente2_db < database/dumps/cliente2_db.sql
```

3. Crie um usuário para a aplicação (se necessário):

```sql
CREATE USER 'usuario'@'localhost' IDENTIFIED BY 'senha';
GRANT ALL PRIVILEGES ON default_db.* TO 'usuario'@'localhost';
GRANT ALL PRIVILEGES ON cliente1_db.* TO 'usuario'@'localhost';
GRANT ALL PRIVILEGES ON cliente2_db.* TO 'usuario'@'localhost';
GRANT ALL PRIVILEGES ON cliente3_db.* TO 'usuario'@'localhost';
FLUSH PRIVILEGES;
```

### 3. Configuração de Hosts Locais

Para testar os diferentes tenants localmente, você precisa configurar alguns hosts no seu arquivo de hosts:

1. Abra o arquivo hosts como administrador:
   - Windows: `C:\Windows\System32\drivers\etc\hosts`
   - Linux/Mac: `/etc/hosts`

2. Adicione as seguintes linhas:

```
127.0.0.1 localhost
127.0.0.1 default.localhost
127.0.0.1 cliente1_db.localhost
127.0.0.1 cliente2_db.localhost
127.0.0.1 cliente3_db.localhost
```

### 4. Iniciando o Servidor

```bash
npm run dev
# ou
yarn dev
```

## Estrutura do Sistema

### Arquitetura Multitenant

O sistema utiliza uma abordagem de banco de dados por tenant. Cada cliente possui seu próprio banco de dados isolado, identificado pelo subdomínio na URL.

### Middleware de Resolução de Tenant

O arquivo `src/middleware.ts` é responsável por detectar o subdomínio da requisição e definir o tenant correspondente nos headers da requisição. Este tenant é então utilizado para conectar ao banco de dados específico do cliente.

### Contexto de Autenticação

O sistema implementa um contexto de autenticação simples (`src/context/AuthContext.tsx`) que gerencia o estado de login do usuário. A autenticação é baseada apenas em e-mail para fins de demonstração.

### Rotas Protegidas

O componente `ProtectedRoute` garante que apenas usuários autenticados possam acessar determinadas páginas, como o dashboard.

## Como Usar o Sistema

### Acessando Diferentes Tenants

Você pode acessar diferentes tenants usando os seguintes URLs:

- **Tenant Padrão**: [http://default.localhost:3000](http://default.localhost:3000)
- **Cliente 1**: [http://cliente1_db.localhost:3000](http://cliente1_db.localhost:3000)
- **Cliente 2**: [http://cliente2_db.localhost:3000](http://cliente2_db.localhost:3000)
- **Cliente 3**: [http://cliente3_db.localhost:3000](http://cliente3_db.localhost:3000) (sem dados)

### Fluxo de Uso

1. Acesse um dos URLs acima
2. Na página inicial, clique em "Fazer Login"
3. Insira qualquer e-mail válido (não há validação real)
4. Após o login, você será redirecionado para o dashboard
5. No dashboard, você verá os usuários e posts específicos do tenant atual
6. Para sair, clique no botão "Sair" no canto superior direito

### Dados de Exemplo

#### Tenant Default
- Usuários: admin@default.com, usuario@default.com, suporte@default.com
- Posts: 3 posts informativos sobre o sistema

#### Cliente 1
- Usuários: joao@cliente1.com, maria@cliente1.com, pedro@cliente1.com, ana@cliente1.com
- Posts: 5 posts relacionados a vendas, produtos e marketing

#### Cliente 2
- Usuários: roberto@cliente2.com, carla@cliente2.com, fernando@cliente2.com
- Posts: 4 posts sobre projetos, análises e resultados financeiros

## Estrutura de Arquivos

```
/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── posts/
│   │   │   │   └── route.ts     # API de posts
│   │   │   └── users/
│   │   │       └── route.ts     # API de usuários
│   │   ├── dashboard/
│   │   │   └── page.tsx         # Página do dashboard (protegida)
│   │   ├── login/
│   │   │   └── page.tsx         # Página de login
│   │   ├── layout.tsx           # Layout principal com AuthProvider
│   │   └── page.tsx             # Página inicial
│   ├── components/
│   │   └── ProtectedRoute.tsx   # Componente de proteção de rotas
│   ├── context/
│   │   └── AuthContext.tsx      # Contexto de autenticação
│   └── middleware.ts            # Middleware de resolução de tenant
├── lib/
│   └── prisma.ts               # Cliente Prisma com suporte a multitenant
├── database/
│   ├── dumps/                  # Dumps dos bancos de dados
│   │   ├── default_db.sql
│   │   ├── cliente1_db.sql
│   │   └── cliente2_db.sql
│   ├── setup_databases.sql     # Script para criar os bancos
│   └── importar_bancos.bat     # Script para importar os dumps (Windows)
├── next.config.ts             # Configuração do Next.js
└── tsconfig.json              # Configuração do TypeScript
```

## Desenvolvimento

### Adicionando um Novo Tenant

1. Crie um novo banco de dados para o tenant
2. Adicione o nome do tenant à lista de tenants permitidos no middleware
3. Configure o host local para o novo tenant

### Personalizando o Sistema

Para personalizar o sistema para uso em produção:

1. Implemente uma autenticação real (como NextAuth.js)
2. Configure variáveis de ambiente para as conexões de banco de dados
3. Adicione validações e tratamento de erros mais robustos
4. Implemente um sistema de permissões por usuário

## Considerações de Segurança

- Este é um sistema de demonstração e não deve ser usado em produção sem modificações
- A autenticação é simplificada e não segura para ambientes reais
- As credenciais de banco de dados estão hardcoded no código
- Não há validação de entrada nos formulários

## Suporte

Para dúvidas ou problemas, abra uma issue no repositório do projeto.
