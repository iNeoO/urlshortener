# Monitoring Stack

For local development, this project includes:

- RabbitMQ Management UI (`http://localhost:15672`)
- RabbitMQ Prometheus metrics endpoint (`http://localhost:15692/metrics`)
- Prometheus (`http://localhost:9090`)
- Grafana (`http://localhost:3003`, `admin/admin`)

## Start

For local infra:

```bash
docker compose up -d
```

For the production application:

```bash
docker compose --env-file .env.docker -f docker-compose.prod.yaml up -d
```

Production does not start a project-local RabbitMQ or monitoring stack.
RabbitMQ is the shared `rabbitmq-prod` service from `../infra`. Its management
UI is bound to `127.0.0.1:15673`, and its Prometheus endpoint is
`rabbitmq-prod:15692/metrics` inside `monitoring-shared`.

## What is preconfigured

- Prometheus scrape job for the local-development RabbitMQ (`rabbitmq:15692`)
- Shared production observability should scrape RabbitMQ at
  `rabbitmq-prod:15692`
- Prometheus scrape jobs for backend (`backend:4000/metrics`) and redirector (`redirector:4001/metrics`)
  - Fallback host targets are also configured (`host.docker.internal:4000/4001`) for local processes started outside Docker
- Alert rules in `monitoring/prometheus/alerts.yml`
- Grafana provisioning:
  - Datasource: `Prometheus`
  - Dashboard: `RabbitMQ Overview`
  - Dashboard: `HTTP Services Overview` (grouped by Backend / Redirector)
  - Folder: `Observability`

## Included starter alerts

- `RabbitMQDown`
- `RabbitMQQueueBacklogHigh`
- `RabbitMQUnackedHigh`
- `RabbitMQNoConsumersOnNonEmptyQueue`
- `RabbitMQDLQHasMessages`
