#!/bin/sh
set -e

pnpm --filter @urlshortener/db migrate

exec pnpm --filter @urlshortener/backend start:backend
