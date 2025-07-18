# Documentação Técnica: Sistema Multitenant com Next.js e TypeScript

## Visão Geral da Arquitetura

Este documento fornece uma explicação técnica detalhada sobre a implementação de um sistema multitenant usando Next.js, TypeScript e Prisma. A arquitetura adotada é baseada no modelo de "banco de dados por tenant", onde cada cliente (tenant) possui seu próprio banco de dados isolado.

## Tecnologias Utilizadas

### Next.js 14

O Next.js é um framework React que oferece renderização híbrida (SSR, SSG e CSR), roteamento baseado em sistema de arquivos, e otimizações de performance. Neste projeto, utilizamos o Next.js 14 com a App Router API, que oferece:

- **Roteamento baseado em pasta**: A estrutura de pastas em `/app` define as rotas da aplicação
- **Componentes de servidor e cliente**: Separação clara entre componentes que rodam no servidor e no cliente
- **Middleware**: Interceptação e manipulação de requisições antes de chegarem às rotas

### TypeScript

TypeScript é utilizado em todo o projeto para garantir tipagem estática, melhorando a manutenibilidade e reduzindo erros em tempo de execução. Benefícios incluem:

- **Interfaces e tipos**: Definição clara de estruturas de dados
- **Verificação de tipos em tempo de compilação**: Detecção precoce de erros
- **IntelliSense aprimorado**: Melhor experiência de desenvolvimento

### Prisma ORM

Prisma é um ORM (Object-Relational Mapping) moderno que simplifica o acesso ao banco de dados:

- **Schema Prisma**: Define o modelo de dados de forma declarativa
- **Cliente Prisma**: API tipada para interagir com o banco de dados
- **Migrações**: Gerenciamento de alterações no esquema do banco de dados

## Implementação Multitenant

### 1. Middleware de Resolução de Tenant

O middleware é o componente central para a implementação multitenant. Ele intercepta todas as requisições e identifica o tenant com base no subdomínio.

```typescript
// src/middleware.ts
import { NextRequest, NextResponse } from 'next/server'

export function middleware(request: NextRequest): NextResponse {
    // Extrai o hostname da requisição
    const hostname = request.headers.get('host') || '';
    let subdomain = hostname.split('.')[0];

    // Lógica para extrair o subdomínio
    if (hostname.includes('localhost') || hostname.includes('127.0.0.1')) {
        const parts = hostname.split('.');
        if (parts.length > 1) {
            subdomain = parts[0];
        } else {
            subdomain = 'default';
        }
    }

    // Lista de tenants permitidos
    const allowedTenants: string[] = ['cliente1_db', 'cliente2_db', 'cliente3_db', 'default'];
    if (!allowedTenants.includes(subdomain)) {
        subdomain = 'default';
    }
    
    // Adiciona o tenant nos headers para uso posterior
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set('x-tenant', subdomain);
    
    // Continua o processamento da requisição com o header de tenant
    return NextResponse.next({
        request: {
            headers: requestHeaders,
        },
    });
}

// Define quais rotas o middleware deve processar
export const config = {
    matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
```

O middleware:
1. Extrai o subdomínio da URL
2. Valida se é um tenant permitido
3. Adiciona o tenant como header `x-tenant`
4. Passa a requisição para o próximo handler

### 2. Cliente Prisma Dinâmico

Para suportar múltiplos bancos de dados, implementamos um cliente Prisma dinâmico que seleciona o banco de dados correto com base no tenant:

```typescript
// lib/prisma.ts
import { PrismaClient } from '@prisma/client'

// Cache de instâncias do Prisma por tenant
const prismaInstances = new Map<string, PrismaClient>()

export function getPrismaClient(tenant: string): PrismaClient {
  if (!tenant) {
    console.error('Tenant não fornecido para getPrismaClient');
    tenant = 'default';
  }
  
  // Se não existe uma instância para este tenant, cria uma nova
  if (!prismaInstances.has(tenant)) {
    // Formata o nome do banco de dados
    const dbName = tenant.endsWith('_db') ? tenant : `${tenant}_db`;
    const databaseUrl = `mysql://usuario:senha@localhost:3306/${dbName}`
    
    // Cria uma nova instância do Prisma com a URL específica do tenant
    const prisma = new PrismaClient({
      datasources: {
        db: {
          url: databaseUrl,
        },
      },
    })
    
    prismaInstances.set(tenant, prisma)
  }
  
  return prismaInstances.get(tenant) as PrismaClient
}

// Função para fechar todas as conexões
export async function disconnectAll(): Promise<void> {
  const promises = Array.from(prismaInstances.values()).map(prisma => prisma.$disconnect())
  await Promise.all(promises)
  prismaInstances.clear()
}
```

Este módulo:
1. Mantém um cache de instâncias do Prisma por tenant
2. Cria dinamicamente conexões para diferentes bancos de dados
3. Reutiliza conexões para melhorar a performance

### 3. API Routes com Suporte a Multitenant

As rotas da API extraem o tenant do header e usam o cliente Prisma correspondente:

```typescript
// src/app/api/posts/route.ts
import { NextRequest } from 'next/server';
import { getPrismaClient } from '../../../../lib/prisma';

export async function GET(request: NextRequest): Promise<Response> {
  // Extrai o tenant do header definido pelo middleware
  const tenant = request.headers.get('x-tenant') || '';
  // Obtém o cliente Prisma específico para este tenant
  const prisma = getPrismaClient(tenant);
  
  try {
    // Consulta os posts no banco de dados do tenant
    const posts = await prisma.post.findMany({
      include: { author: true }
    });
    return Response.json(posts);
  } catch (error) {
    console.error('Database error:', error);
    return Response.json({ error: 'Database error' }, { status: 500 });
  }
}
```

### 4. Contexto de Autenticação

Para gerenciar o estado de autenticação do usuário, implementamos um contexto React:

```typescript
// src/context/AuthContext.tsx
"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';

interface AuthContextType {
  user: { email: string } | null;
  login: (email: string) => void;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<{ email: string } | null>(null);
  const router = useRouter();

  // Verifica se o usuário já está logado ao carregar a página
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  // Função para realizar login
  const login = (email: string) => {
    const userData = { email };
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
    router.push('/dashboard');
  };

  // Função para realizar logout
  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
    router.push('/login');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
}

// Hook personalizado para usar o contexto
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
}
```

O contexto de autenticação:
1. Gerencia o estado de login do usuário
2. Persiste a sessão no localStorage
3. Fornece métodos para login e logout
4. Expõe um hook personalizado `useAuth` para componentes filhos

### 5. Proteção de Rotas

Para garantir que apenas usuários autenticados acessem determinadas páginas, implementamos um componente de proteção de rota:

```typescript
// src/components/ProtectedRoute.tsx
"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, router]);

  if (!isAuthenticated) {
    return <div>Redirecionando para o login...</div>;
  }

  return <>{children}</>;
}
```

## Fluxo de Dados

### 1. Resolução do Tenant

1. O usuário acessa a aplicação através de um subdomínio (ex: cliente1_db.localhost:3000)
2. O middleware intercepta a requisição e extrai o subdomínio
3. O middleware adiciona o tenant como header `x-tenant`

### 2. Autenticação

1. O usuário fornece seu e-mail na página de login
2. O contexto de autenticação armazena os dados do usuário no localStorage
3. O usuário é redirecionado para o dashboard

### 3. Acesso aos Dados

1. O componente do dashboard solicita dados da API
2. A API extrai o tenant do header da requisição
3. A função `getPrismaClient` retorna o cliente Prisma específico para o tenant
4. O Prisma consulta o banco de dados correto e retorna os dados
5. Os dados são renderizados na interface do usuário

## Padrões de Projeto Utilizados

### 1. Injeção de Dependência

O tenant é injetado como um header na requisição, permitindo que os componentes downstream acessem essa informação sem precisar passá-la explicitamente.

### 2. Factory Pattern

A função `getPrismaClient` atua como uma factory que cria e gerencia instâncias do Prisma Client para diferentes tenants.

### 3. Context API

Utilizamos o Context API do React para gerenciar o estado de autenticação e compartilhá-lo entre componentes.

### 4. Middleware Pattern

O middleware do Next.js é utilizado para interceptar requisições e adicionar informações de contexto.

## Considerações sobre Performance

### Conexões de Banco de Dados

O sistema mantém um cache de conexões do Prisma para evitar a criação repetida de conexões para o mesmo tenant, melhorando a performance.

### Renderização no Cliente vs. Servidor

Componentes que não dependem de dados do usuário são renderizados no servidor para melhorar a performance e SEO. Componentes que dependem do estado do usuário são renderizados no cliente.

## Extensibilidade

### Adicionando Novos Tenants

Para adicionar um novo tenant:
1. Crie um novo banco de dados seguindo a convenção de nomenclatura
2. Adicione o tenant à lista de `allowedTenants` no middleware
3. Configure o DNS para apontar o subdomínio para o servidor da aplicação

### Expandindo o Modelo de Dados

Para adicionar novas entidades:
1. Atualize o schema do Prisma
2. Execute as migrações em todos os bancos de dados de tenant
3. Implemente as rotas de API e componentes de UI necessários

## Limitações e Melhorias Futuras

### Limitações Atuais

1. **Autenticação Simplificada**: A autenticação baseada apenas em e-mail não é segura para ambientes de produção
2. **Credenciais Hardcoded**: As credenciais do banco de dados estão no código-fonte
3. **Sem Validação de Entrada**: Não há validação robusta nos formulários

### Melhorias Potenciais

1. **Autenticação Robusta**: Implementar NextAuth.js com provedores OAuth
2. **Variáveis de Ambiente**: Mover credenciais para variáveis de ambiente
3. **Validação de Formulários**: Adicionar bibliotecas como Zod ou Yup
4. **Cache**: Implementar cache de dados com SWR ou React Query
5. **Testes Automatizados**: Adicionar testes unitários e de integração

## Conclusão

Esta implementação multitenant demonstra como criar um sistema onde múltiplos clientes podem acessar suas próprias instâncias isoladas da aplicação através de subdomínios. A abordagem de "banco de dados por tenant" oferece isolamento completo de dados, enquanto o código da aplicação é compartilhado entre todos os tenants.

O uso de TypeScript, Next.js e Prisma proporciona uma base sólida e tipada para o desenvolvimento, facilitando a manutenção e evolução do sistema.
