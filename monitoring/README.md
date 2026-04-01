# Monitoring Stack

This project now includes:

- RabbitMQ Management UI (`http://localhost:15672`)
- RabbitMQ Prometheus metrics endpoint (`http://localhost:15692/metrics`)
- Prometheus (`http://localhost:9090`)
- Grafana (`http://localhost:3003`, `admin/admin`)

## Start

For local infra:

```bash
docker compose up -d
```

For full stack:

```bash
docker compose -f docker-compose.start.yaml up -d
```

## What is preconfigured

- Prometheus scrape job for RabbitMQ (`rabbitmq:15692`)
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
