# Urlshortener

A Full-stack URL shortener implementation.

## Features

- Shorten a valid URL into a short code
- Redirect from short URLs to the original URL
- Basic analytics (per-url windowed counts)
- OpenAPI docs exposed by the backend

## Tech stack

- **Frontend:** React + TypeScript + Vite + Tailwind
- **Backend:** Node.js + TypeScript + Hono
- **Database:** PostgreSQL (Prisma ORM)
- **Cache/queue:** Redis
- **Monorepo:** pnpm workspaces

## Project structure

- `apps/frontend` — UI + client logic
- `apps/backend` — API, redirect, background workers
- `db` — Prisma schema + migrations
- `nginx` — reverse proxy config for Docker start mode

## How to run (Docker / first launch)

```bash
cp .env.docker.example .env.docker
docker compose --env-file .env.docker -f docker-compose.start.yaml up --build
# app: http://localhost:3000
# api: http://localhost:3002
```

## How to run (Local dev)

```bash
cp .env.exemple .env
pnpm install
docker compose up --build
pnpm run db:migrate
pnpm run db:generate
pnpm run db:build
pnpm run common:build
pnpm run infra:build
pnpm run services:build
pnpm run backend:build
pnpm run dev
# app: http://localhost:5173
# api: http://localhost:4000
```

## Main technical choices

- **Hono** for a small, fast API surface and type-safe validation (with Zod)
- **Prisma + Postgres** for strongly-typed queries and migrations
- **Redis/queue** for short-lived counters and worker coordination
- **Workers** to compute windowed counts without slowing the API path (we use a setInterval but it's not production-ready; BullMQ or an alternative should be used there)

## Assumptions / shortcuts

- No auth or rate limiting (could be added in a production pass)
- Short code uniqueness handled by backend, not designed for multi-instance deployment
- Single Postgres instance; no read replicas

## Notes for reviewers

- OpenAPI/Scalar docs are exposed by the backend (see `apps/backend/src/libs/openAPI.ts`) on <frontend-url>/api/openai/ui
- The stack is ready to run locally with Docker or via pnpm dev scripts
