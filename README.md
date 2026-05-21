# Urlshortener

A full-stack URL shortener monorepo with authentication, shared workspaces, invitation flows, short-link redirection, background analytics processing, and monitoring.

## Application URL

- Production: `https://urlshortener.tuturu.io`

## Features

- User authentication with sign up, sign in, sign out, email validation, and password reset
- Shared groups with member roles and invitation management
- URL creation and listing inside a workspace
- Dedicated redirector service for short-link resolution
- Aggregated click analytics by time range, browser, OS, device, and referrer
- Background workers for mail delivery and stats ingestion/aggregation
- OpenAPI documentation for backend and redirector services
- Prometheus metrics and Grafana dashboards for observability

## Tech stack

- Frontend: React 19, TypeScript, Vite, Tailwind CSS 4, TanStack Router, TanStack Query
- Backend API: Node.js, TypeScript, Hono, Zod
- Redirector: Node.js, TypeScript, Hono
- Database: PostgreSQL with Prisma
- Messaging and cache: RabbitMQ and Redis
- Monitoring: Prometheus and Grafana
- Monorepo: pnpm workspaces

## Monorepo layout

- `apps/frontend`: authenticated UI and public landing page
- `apps/backend`: API for auth, profile, groups, invitations, URLs, and stats
- `apps/redirector`: public redirect service and click event publishing
- `workers/notifications-mail-worker`: async email sending worker
- `workers/stats-events-worker`: click event consumer and stats ingestion worker
- `workers/stats-aggregate-worker`: rollup worker for hourly and daily stats tables
- `crons/stats-aggregate-cron`: scheduler for aggregation jobs
- `packages/common`: shared schemas, constants, and types
- `packages/services`: domain services used by the apps and workers
- `packages/infra`: logging, env, Redis, helpers, and shared infrastructure code
- `db`: Prisma schema, migrations, and database package
- `monitoring`: Prometheus, Grafana, and RabbitMQ monitoring config
- `scripts`: local data-generation utilities

## Architecture

The runtime is split into a few focused processes:

- Frontend on `5173` in dev
- Backend API on `4000`
- Redirector on `4001`
- PostgreSQL on `5435`
- Redis on `6379`
- RabbitMQ on `5672`, management UI on `15672`, Prometheus metrics on `15692`
- MailDev UI on `4020`, SMTP on `4025`
- Prometheus on `9090`
- Grafana on `3003`

The redirector publishes click events. Workers consume and aggregate those events so analytics do not slow down the redirect path.

## Local development

### 1. Install dependencies

```bash
pnpm install
```

### 2. Create the local env file

```bash
cp .env.exemple .env
```

The repo currently uses `.env.exemple` as the template filename.

### 3. Start infrastructure

```bash
docker compose up -d
```

This starts PostgreSQL, Redis, MailDev, RabbitMQ, Prometheus, and Grafana.

### 4. Generate Prisma client and run migrations

```bash
pnpm run db:generate
pnpm run db:migrate
```

### 5. Start the full application

```bash
pnpm run dev
```

This launches the frontend, backend, redirector, mail worker, stats workers, and stats aggregation cron.

### Local URLs

- Frontend: `http://localhost:5173`
- Backend API: `http://localhost:4000`
- Redirector: `http://localhost:4001`
- Backend OpenAPI UI: `http://localhost:4000/openapi/ui`
- Redirector OpenAPI UI: `http://localhost:4001/openapi/ui`
- MailDev: `http://localhost:4020`
- RabbitMQ Management: `http://localhost:15672`
- Prometheus: `http://localhost:9090`
- Grafana: `http://localhost:3003` with `admin/admin`

## Dockerized stack

A production-style compose file is available in [`docker-compose.prod.yaml`](/home/ineoo/github/ineoo/urlshortener/docker-compose.prod.yaml).

### 1. Create the Docker env file

```bash
cp .env.docker.example .env.docker
```

### 2. Start the stack

```bash
docker compose --env-file .env.docker -f docker-compose.prod.yaml up --build
```

With the default example values:

- Frontend: `http://localhost:3002`
- Backend API: `http://localhost:4000`
- Redirector: `http://localhost:4001`

## Available root scripts

```bash
pnpm run dev
pnpm run build
pnpm run start
pnpm run test
pnpm run lint
pnpm run db:generate
pnpm run db:migrate
pnpm run db:deploy
pnpm run db:reset
```

There are also focused scripts for individual services such as `backend:dev`, `redirector:dev`, `worker:mail:dev`, `worker:stats-events:dev`, and `cron:stats-aggregate:dev`.

## Data model summary

Core entities include:

- `User`
- `Session`
- `Group`
- `GroupMember`
- `GroupInvitation`
- `Url`
- `UrlWindowCount`, `UrlHourCount`, `UrlDayCount`
- Dimension-based stats tables for browser, OS, device, and referrer breakdowns

Role constants are defined as owner, admin, member, and guest.

## Observability

The repo includes a ready-to-run monitoring setup in [`monitoring/README.md`](/home/ineoo/github/ineoo/urlshortener/monitoring/README.md):

- Prometheus scrape config for RabbitMQ and HTTP services
- Alert rules in `monitoring/prometheus/alerts.yml`
- Provisioned Grafana dashboards for RabbitMQ and HTTP services
- Metrics endpoints exposed by backend and redirector on `/metrics`

## Notes

- The older README referenced `docker-compose.start.yaml`; that file is not present in this repo.
- The frontend package serves static files only in its container. API proxying for `/api` is handled by [`nginx/start.conf`](/home/ineoo/github/ineoo/urlshortener/nginx/start.conf) when that reverse proxy is used.
