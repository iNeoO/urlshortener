# Reference

## Target workspace

```text
apps/
  backend/
  frontend/
packages/
  infra/
  services/
  db/
  common/
```

## Backend module layout

Each backend domain should follow this structure:

```text
apps/backend/src/modules/<domain>/
  <domain>.controller.ts
  <domain>.route.ts
  schemas.ts
  types.ts
```

Recommended responsibilities:

- `schemas.ts`: request schemas, query/path param schemas, response payload schemas, and API envelope schemas.
- `<domain>.route.ts`: OpenAPI route descriptions built from the schemas.
- `types.ts`: `z.infer` exports derived from the schemas.
- `<domain>.controller.ts`: Hono controller and handlers only.

## Schema pattern

Keep all transport schemas in `schemas.ts`.

```ts
import { z } from "zod";

export const CreateThingJsonSchema = z.object({
  name: z.string().min(1),
});

export const ThingSchema = z.object({
  id: z.string(),
  name: z.string(),
  createdAt: z.string(),
});

export const ThingApiResponseSchema = z.object({
  data: ThingSchema,
});

export const ThingsApiResponseSchema = z.object({
  data: z.array(ThingSchema),
  meta: z
    .object({
      total: z.number().optional(),
      offset: z.number().optional(),
      limit: z.number().optional(),
    })
    .optional(),
});
```

## Type pattern

Infer every transport type from the schemas instead of handwriting response DTOs.

```ts
import type { z } from "zod";
import type {
  CreateThingJsonSchema,
  ThingApiResponseSchema,
  ThingsApiResponseSchema,
  ThingSchema,
} from "./schemas.js";

export type CreateThingBody = z.infer<typeof CreateThingJsonSchema>;
export type ThingDto = z.infer<typeof ThingSchema>;
export type ThingApiResponse = z.infer<typeof ThingApiResponseSchema>;
export type ThingsApiResponse = z.infer<typeof ThingsApiResponseSchema>;
```

## OpenAPI route pattern

Use the same response schema in route registration.

```ts
import { openApiResponse, openApiResponses } from "@app/infra/helpers";
import { describeRoute } from "hono-openapi";
import {
  ThingSchema,
  ThingsApiResponseSchema,
  ThingApiResponseSchema,
} from "./schemas.js";

export const GetThingsRoute = describeRoute({
  responses: {
    ...openApiResponses(ThingSchema, 200, "List things"),
  },
});

export const PostThingRoute = describeRoute({
  responses: {
    ...openApiResponse(ThingSchema, 201, "Create thing"),
  },
});
```

If the project uses helpers like `openApiResponse(schema)` that internally build `{ data: schema }`, the controller should return an object typed from the matching inferred response type.

## Strict controller pattern

Controllers must return objects typed from the declared response schema. Do not add a `safeParse`/`parse` step by default if the service layer already guarantees a typesafe contract.

```ts
import { validator } from "hono-openapi";
import { appWithLogs } from "@app/infra/factories";
import { GetThingsRoute, PostThingRoute } from "./things.route.js";
import {
  CreateThingJsonSchema,
} from "./schemas.js";
import type { ThingApiResponse, ThingsApiResponse } from "./types.js";

export const createThingsController = (services: ThingsControllerServices) =>
  appWithLogs
    .createApp()
    .get("/", GetThingsRoute, async (c) => {
      const items = await services.thingsService.list();
      const response: ThingsApiResponse = {
        data: items,
      };
      return c.json(response, 200);
    })
    .post(
      "/",
      PostThingRoute,
      validator("json", CreateThingJsonSchema),
      async (c) => {
        const body = c.req.valid("json");
        const item = await services.thingsService.create(body);
        const response: ThingApiResponse = {
          data: item,
        };
        return c.json(response, 201);
      },
    );
```

This gives two guarantees:

- OpenAPI stays aligned with the schema source of truth
- compile-time compatibility through the inferred response type

## App wiring

Register modules centrally in `apps/backend/src/app.ts`.

```ts
import { createThingsController } from "./modules/things/things.controller.js";

export const createApp = (services = container) => {
  const thingsController = createThingsController(services);

  return new Hono().route("/things", thingsController);
};
```

## Shared package guidance

- `packages/common`: cross-app schemas, enums, DTOs, public contracts.
- `packages/infra`: env, helpers, middleware, OpenAPI helpers, logging, generic response helpers.
- `packages/services`: business logic and orchestration.
- `packages/db`: database client, schema, migrations, persistence helpers.

## Frontend guidance

When a frontend is part of the request:

- use the backend Hono client types as the source of truth
- infer request bodies from shared `schemas.ts`
- avoid duplicating backend response interfaces manually

## Delivery checklist

- Workspace matches the target split.
- Backend uses `src/modules/*`, not `src/features/*`.
- Each module has `controller`, `route`, `schemas`, and `types`.
- Every API response has a schema in `schemas.ts`.
- Every controller returns JSON typed from the response schema.
- OpenAPI responses reference the same schemas that controllers are typed against.
- Shared contracts live in `packages/common` when reused across apps.
