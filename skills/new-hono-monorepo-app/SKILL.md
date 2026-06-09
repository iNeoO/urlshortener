---
name: new-hono-monorepo-app
description: Scaffolds a new monorepo application modeled on this repository with `apps/backend`, `apps/frontend`, and shared `packages/*`, using Hono on the backend and strict schema-first contracts. Use when creating a new app from this repo's architecture, when the user asks for a new domain/module under `src/modules/*`, or when API request/response schemas must be defined in `schemas.ts` and enforced through OpenAPI-inferred types.
---

# New Hono Monorepo App

## Purpose

Create a new application that keeps this repo's monorepo split, but uses the target backend convention:

- `apps/backend`
- `apps/frontend`
- `packages/infra`
- `packages/services`
- `packages/db`
- `packages/common`

Backend domains must live in `apps/backend/src/modules/<domain>/`.

## Workflow

1. Inspect the existing repo before scaffolding anything.
2. Preserve the workspace split above unless the user explicitly asks otherwise.
3. Create each backend domain in `src/modules/<domain>/` with:
   - `<domain>.controller.ts`
   - `<domain>.route.ts`
   - `schemas.ts`
   - `types.ts`
   - optional nested submodules only when the domain is materially large.
4. Put request validation schemas and response payload schemas in `schemas.ts`.
5. Define OpenAPI routes from those schemas in `<domain>.route.ts`.
6. Infer TypeScript response types from the response schemas in `types.ts`.
7. In controllers, build responses that are both:
   - statically typed from the inferred schema type
   - structurally aligned with the schema registered in OpenAPI
8. Wire the module in `apps/backend/src/app.ts`.
9. Reuse shared schemas from `packages/common` and shared helpers from `packages/infra` instead of duplicating contracts.
10. When frontend work is requested, consume the backend through the typed Hono client and shared schema types.

## Rules

- Prefer schema-first design.
- Every JSON response must come from a response schema declared in `schemas.ts`.
- Do not return untyped ad hoc objects from controllers.
- Do not re-parse controller responses with Zod by default when the service layer already guarantees a typesafe contract.
- Keep transport schemas separate from database models.
- Use `packages/common` for cross-app schemas and DTO-level contracts.
- Use `packages/services` for business logic and `packages/db` for persistence concerns.

## Response Contract Pattern

For each route:

1. Define the payload schema in `schemas.ts`.
2. Wrap it in the standard API envelope schema.
3. Export the inferred API type from `types.ts`.
4. Register the same schema in the OpenAPI route description.
5. In the controller, return an object typed from that schema before `c.json(...)`.

See [REFERENCE.md](REFERENCE.md) for the file layout, templates, and the response contract pattern.
