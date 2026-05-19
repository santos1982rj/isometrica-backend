# AGENTS.md — ISOMÉTRICA

## Contexto do produto

A ISOMÉTRICA é uma plataforma acadêmica para estudantes de engenharia, criada por estudante para estudantes.

Objetivo:
- ajudar o aluno a estudar melhor;
- entender conceitos difíceis;
- validar raciocínios;
- evoluir academicamente;
- manter rigor técnico de engenharia.

A plataforma NÃO deve ser tratada como resolvedor automático de exercícios. A IA deve atuar como monitor técnico, explicador e validador de raciocínio.

## Princípios do produto

- Clareza para estudar.
- Rigor para evoluir.
- Linguagem acessível, mas tecnicamente correta.
- Ferramentas de cálculo devem validar o estudo, não substituir o raciocínio.
- Visual técnico, acadêmico e premium.
- Evitar gamificação infantil.
- Priorizar maturidade técnica do estudante.

## Stack

### Backend
- Node.js
- Express
- TypeScript
- Prisma 7
- PostgreSQL
- JWT
- Zod

### Frontend
- React
- Vite
- TypeScript
- Tailwind v4
- Zustand
- TanStack Query
- React Router

## Arquitetura

Usar arquitetura feature-based.

Exemplos:
- `features/auth`
- `features/courses`
- `features/lessons`
- `features/progress`
- `features/player`
- `features/calculators`
- `features/study-validation`

Não criar pastas genéricas por tipo como `controllers/`, `services/` globais, exceto dentro de cada feature.

## Regras de código

- Não usar `any`.
- Não criar SQL cru se Prisma resolver.
- Validar entradas com Zod.
- Usar TypeScript strict.
- Usar nomes claros em português quando forem entidades de domínio.
- Controllers devem ser finos.
- Services devem conter regra de negócio.
- Não expor dados sensíveis.
- Não commitar `.env`.

## Design system

Manter:
- Dark mode técnico como padrão;
- Liquid Glass controlado;
- Bento Grid;
- tokens semânticos;
- visual de engenharia;
- evitar excesso de glow/neon.

Futuro:
- implementar light mode corretamente usando tokens semânticos.

## Funcionalidades atuais

Backend:
- auth JWT;
- usuário autenticado;
- cursos;
- módulos;
- aulas;
- player MVP;
- progresso de aula persistido.

Frontend:
- login;
- dashboard;
- app shell;
- listagem de disciplinas;
- página individual do curso;
- player;
- progresso visual.

## Próximas prioridades

1. Refinar progresso acadêmico.
2. Criar player mais robusto.
3. Criar exercícios.
4. Criar study-validation.
5. Criar mapa de domínio.
6. Criar modo pré-prova.
7. Preparar light mode.
8. Evoluir analytics acadêmico.

## Comandos

Backend:
- `npm install`
- `npm run dev`
- `npm run seed`
- `npx prisma generate`
- `npx prisma migrate dev`

Frontend:
- `npm install`
- `npm run dev`
- `npm run build`