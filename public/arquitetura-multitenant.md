# Arquitetura do Sistema Multitenant

## Diagrama de Arquitetura

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│  cliente1_db.localhost:3000   cliente2_db.localhost:3000    │
│           │                             │                   │
└───────────┼─────────────────────────────┼───────────────────┘
            │                             │
            ▼                             ▼
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│                      Middleware                             │
│                                                             │
│    ┌─────────────────────────────────────────────────┐      │
│    │  Extração do Tenant (subdomínio)                │      │
│    │  Validação do Tenant                            │      │
│    │  Adição do header x-tenant                      │      │
│    └─────────────────────────────────────────────────┘      │
│                          │                                  │
└──────────────────────────┼──────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│                   Next.js App Router                        │
│                                                             │
│    ┌─────────────────┐    ┌───────────────────────────┐     │
│    │                 │    │                           │     │
│    │  Páginas        │    │  API Routes               │     │
│    │  - /            │    │  - /api/users             │     │
│    │  - /login       │    │  - /api/posts             │     │
│    │  - /dashboard   │    │                           │     │
│    │                 │    │                           │     │
│    └────────┬────────┘    └─────────────┬─────────────┘     │
│             │                           │                   │
└─────────────┼───────────────────────────┼───────────────────┘
              │                           │
              ▼                           ▼
┌─────────────────────────────┐ ┌─────────────────────────────┐
│                             │ │                             │
│  Contexto de Autenticação   │ │  Cliente Prisma Dinâmico    │
│  - Login                    │ │  - getPrismaClient(tenant)  │
│  - Logout                   │ │  - Cache de conexões        │
│  - Estado do usuário        │ │                             │
│                             │ │                             │
└─────────────────────────────┘ └──────────────┬──────────────┘
                                               │
                                               ▼
                               ┌─────────────────────────────┐
                               │                             │
                               │  Bancos de Dados MySQL      │
                               │                             │
                               │  ┌───────────────────────┐  │
                               │  │                       │  │
                               │  │  default_db           │  │
                               │  │                       │  │
                               │  └───────────────────────┘  │
                               │                             │
                               │  ┌───────────────────────┐  │
                               │  │                       │  │
                               │  │  cliente1_db          │  │
                               │  │                       │  │
                               │  └───────────────────────┘  │
                               │                             │
                               │  ┌───────────────────────┐  │
                               │  │                       │  │
                               │  │  cliente2_db          │  │
                               │  │                       │  │
                               │  └───────────────────────┘  │
                               │                             │
                               └─────────────────────────────┘
```

## Fluxo de Requisição

```
┌────────────┐     ┌────────────┐     ┌────────────┐     ┌────────────┐
│            │     │            │     │            │     │            │
│  Usuário   │────▶│ Middleware │────▶│   Router   │────▶│    API     │
│            │     │            │     │            │     │            │
└────────────┘     └────────────┘     └────────────┘     └────────────┘
                         │                                      │
                         │                                      │
                         ▼                                      ▼
                   ┌────────────┐                        ┌────────────┐
                   │            │                        │            │
                   │  Header    │                        │  Prisma    │
                   │  x-tenant  │                        │  Client    │
                   │            │                        │            │
                   └────────────┘                        └────────────┘
                                                               │
                                                               │
                                                               ▼
                                                         ┌────────────┐
                                                         │            │
                                                         │  Banco de  │
                                                         │  Dados     │
                                                         │  do Tenant │
                                                         │            │
                                                         └────────────┘
```

## Modelo de Dados

```
┌───────────────────┐       ┌───────────────────┐
│                   │       │                   │
│      User         │       │      Post         │
│                   │       │                   │
│ - id: string      │       │ - id: string      │
│ - name: string    │◄──────┤ - title: string   │
│ - email: string   │       │ - content: text   │
│ - posts: Post[]   │       │ - authorId: string│
│                   │       │ - author: User    │
└───────────────────┘       └───────────────────┘
```

## Componentes Principais

### Middleware (src/middleware.ts)
Responsável por detectar o tenant a partir do subdomínio e adicioná-lo como header na requisição.

### Cliente Prisma (lib/prisma.ts)
Gerencia conexões dinâmicas com diferentes bancos de dados baseado no tenant.

### Contexto de Autenticação (src/context/AuthContext.tsx)
Gerencia o estado de autenticação do usuário em toda a aplicação.

### Rotas Protegidas (src/components/ProtectedRoute.tsx)
Garante que apenas usuários autenticados possam acessar determinadas páginas.

### API Routes (src/app/api/*)
Endpoints que acessam o banco de dados específico do tenant para operações CRUD.
