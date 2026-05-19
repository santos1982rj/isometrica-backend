# ISOMÉTRICA — Backend

Backend da plataforma acadêmica ISOMÉTRICA.

Sistema desenvolvido para estudantes de engenharia, com foco em:

* rigor técnico;
* clareza acadêmica;
* validação de estudo;
* evolução real do aluno.

A ISOMÉTRICA não é um resolvedor automático de exercícios.
A IA atua como monitor técnico e validador de raciocínio.

---

# Stack

* Node.js
* Express
* TypeScript
* Prisma ORM
* PostgreSQL
* JWT
* Zod

---

# Arquitetura

Arquitetura baseada em features.

Estrutura principal:

```txt
src/
├── config/
├── core/
├── features/
│   ├── auth/
│   ├── students/
│   ├── courses/
│   ├── lessons/
│   ├── progress/
│   └── player/
```

---

# Funcionalidades atuais

## Auth

* registro;
* login;
* autenticação JWT.

---

## Students

* perfil autenticado;
* sessão persistida.

---

## Courses

* listagem de disciplinas;
* módulos;
* aulas;
* acesso público.

---

## Lessons

* player MVP;
* carregamento de aula;
* suporte futuro para múltiplos providers.

---

## Progress

* conclusão de aula;
* progresso persistido;
* histórico acadêmico.

---

# Filosofia do projeto

A plataforma deve:

* ajudar o aluno a entender;
* validar raciocínios;
* melhorar consistência acadêmica;
* reduzir reprovação;
* manter profundidade técnica.

Evitar:

* respostas automáticas;
* simplificação excessiva;
* gamificação infantil.

---

# Instalação

## Clonar

```bash
git clone https://github.com/santos1982rj/isometrica-backend.git
```

---

## Instalar dependências

```bash
npm install
```

---

# Variáveis de ambiente

Crie um `.env`:

```env
DATABASE_URL=
JWT_SECRET=
PORT=3333
```

---

# Prisma

## Generate

```bash
npx prisma generate
```

---

## Migrations

```bash
npx prisma migrate dev
```

---

## Seed

```bash
npm run seed
```

---

# Rodar projeto

```bash
npm run dev
```

---

# Rotas principais

## Auth

```txt
POST /auth/register
POST /auth/login
```

---

## Students

```txt
GET /students/me
```

---

## Courses

```txt
GET /courses
GET /courses/:slug
```

---

## Lessons

```txt
GET /lessons/:id
```

---

## Progress

```txt
GET /progress/me
POST /progress/lessons/:lessonId/complete
```

---

# Roadmap

## Próximas etapas

* analytics acadêmico;
* mapa de domínio;
* engine de exercícios;
* IA contextual;
* validação de estudo;
* modo pré-prova;
* player avançado;
* light mode;
* simulados;
* monitoria.

---

# Visão

A ISOMÉTRICA busca se tornar:

> infraestrutura acadêmica para estudantes de engenharia.
