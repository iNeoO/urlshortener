#!/bin/sh
set -e

exec pnpm --filter @urlshortener/backend start:workers
