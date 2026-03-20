# RB Woodfinish — Sistema de Gestão de Workflow

Sistema web de gestão completa do ciclo de vida de encomendas para empresa de carpintaria/mobiliário no Algarve, Portugal.

## Stack Tecnológico

- **Frontend:** Next.js 16 (App Router) + TypeScript
- **UI:** TailwindCSS + shadcn/ui + Lucide Icons
- **Backend:** Next.js Server Actions + Route Handlers
- **Base de Dados:** PostgreSQL (Supabase)
- **Autenticação:** Supabase Auth
- **Storage:** Supabase Storage

## Fase 1 — Fundação (MVP)

- Autenticação com login, roles e proteção de rotas
- CRUD de Clientes (Casual B2C / Profissional B2B)
- CRUD de Processos com moradas de obra
- Sistema de 10 Pastas Digitais com upload de documentos
- Estado Global do Processo com transição visual entre fases
- Feed de Ocorrências (timeline imutável por processo)
- Dashboard Admin com processos ativos por fase

## Setup

### 1. Configurar Supabase

1. Criar projeto em [supabase.com](https://supabase.com)
2. Executar o schema SQL em `supabase/schema.sql` no SQL Editor do Supabase
3. Copiar `.env.local` e preencher com as credenciais:

```
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
```

### 2. Criar primeiro utilizador Admin

No Supabase Dashboard → Authentication → Users → Add User:
- Email + Password
- Metadata: `{"nome": "Admin", "role": "admin"}`

### 3. Instalar e correr

```bash
npm install
npm run dev
```

Abrir [http://localhost:3000](http://localhost:3000)

## Estrutura do Projeto

```
src/
├── app/
│   ├── (dashboard)/          # Rotas protegidas com sidebar
│   │   ├── page.tsx          # Dashboard
│   │   ├── clientes/         # CRUD Clientes
│   │   └── processos/        # CRUD Processos
│   ├── auth/callback/        # OAuth callback
│   ├── login/                # Página de login
│   └── layout.tsx            # Root layout
├── components/
│   ├── auth/                 # Login form
│   ├── clientes/             # Componentes de clientes
│   ├── layout/               # Sidebar, Header
│   ├── processos/            # Estado, Pastas, Feed, etc.
│   └── ui/                   # shadcn/ui components
├── lib/
│   ├── actions/              # Server Actions (mutations)
│   ├── supabase/             # Client, Server, Auth, Middleware
│   ├── types/                # TypeScript types
│   ├── constants.ts          # Estados, Pastas, Labels
│   └── utils.ts              # Utilities
└── middleware.ts              # Auth middleware

supabase/
└── schema.sql                # Schema completo da BD (Fase 1)
```

## Roles

| Role | Acesso |
|------|--------|
| `admin` | Acesso total |
| `comercial` | Clientes, Processos, Documentos |
| `armazem` | Processos (leitura), Dashboard |
| `producao` | Processos (leitura), Dashboard |
| `instalacao` | Processos (leitura), Dashboard |
