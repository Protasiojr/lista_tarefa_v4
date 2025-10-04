# Instruções do Copilot para lista_tarefa_v4

## Visão Geral do Projeto
Esta é uma aplicação de gerenciamento de tarefas (lista de tarefas) em Next.js 15 usando Prisma ORM com banco de dados MySQL. O app inclui autenticação de usuário com tokens JWT e gerencia tarefas (Tarefa) e itens (possivelmente subtarefas ou componentes de tarefa).

## Arquitetura
- **Frontend**: Next.js 15 com App Router, React 19, TypeScript, Tailwind CSS v4
- **Backend**: Rotas de API do Next.js (lado do servidor)
- **Banco de Dados**: MySQL via Prisma ORM
- **Autenticação**: JWT usando a biblioteca `jose`, senhas criptografadas com `bcryptjs`

## Modelos Principais (de `prisma/schema.prisma`)
- `Usuario`: Usuários com email, nome, senha criptografada
- `Tarefa`: Tarefas com título, descrição, data, status (booleano)
- `Item`: Itens com título, descrição (provavelmente subtarefas ou componentes de tarefa)

Nota: Os modelos estão definidos, mas os relacionamentos ainda não foram estabelecidos no esquema.

## Fluxo de Desenvolvimento
- **Iniciar servidor de dev**: `npm run dev` (usa Turbopack para builds mais rápidos)
- **Build**: `npm run build` (com Turbopack)
- **Lint**: `npm run lint` (ESLint com regras do Next.js)
- **Banco de Dados**: Use CLI do Prisma para migrações e geração de cliente

## Convenções
- **Idioma**: Português para nomes de modelos, comentários e potencialmente texto da UI
- **Banco de Dados**: Prisma deve sempre ser direcionado ao banco MySQL
- **Cliente Prisma**: Gerado em `app/generated/prisma` (caminho de saída personalizado)
- **Estilização**: Tailwind CSS v4 com variáveis de tema personalizadas em `globals.css`
- **Aliases de Caminho**: `@/*` mapeia para a raiz do projeto em `tsconfig.json`
- **URL do Banco de Dados**: Variável de ambiente `DATABASE_URL` para conexão MySQL

## Padrões
- Use componentes do servidor para busca de dados sempre que possível
- Rotas de API em `app/api/` para lógica de backend
- Autenticação provavelmente tratada via JWT em cookies ou headers
- Criptografia de senha com `bcryptjs` antes de armazenar no DB

## Dependências a Observar
- `jose` para manipulação de JWT (assinatura/verificação)
- `@prisma/client` gerado com caminho de saída personalizado
- Plugin PostCSS do Tailwind v4

## Primeiros Passos
1. Configure o banco de dados MySQL e a variável de ambiente `DATABASE_URL`
2. Execute `npx prisma generate` para gerar o cliente
3. Execute `npx prisma db push` para sincronizar o esquema
4. `npm run dev` para iniciar o desenvolvimento

Concentre-se em implementar autenticação de usuário, CRUD de tarefas e estabelecer relacionamentos entre modelos conforme o app evolui.