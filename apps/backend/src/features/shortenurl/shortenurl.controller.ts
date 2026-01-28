import { HTTPException } from "hono/http-exception";
import { validator } from "hono-openapi";
import { appWithLogs } from "../../helpers/factories/appWithLogs.js";
import {
  PostShortenUrlRoute,
  RedirectShortenUrlRoute,
} from "./shortenurl.route.js";
import {
  GetShortenUrlParamSchema,
  PostShortenUrlJsonSchema,
} from "./shortenurl.schema.js";
import {
  createShortenUrl,
  getShortenUrl,
  incrementShortenUrlClick,
} from "./shortenurl.service.js";
import type { ShortenUrlResponseApi } from "./shortenurl.type.js";
import { idGenerator, toBase62 } from "./shortenurl.utils.js";
import { Prisma } from "@urlshortener/db";

export const shortenurlController = appWithLogs
  .createApp()
  .post(
    "/",
    PostShortenUrlRoute(),
    validator("json", PostShortenUrlJsonSchema),
    async (c) => {
      const params = c.req.valid("json");

      const id = idGenerator.generateId();
      const short = toBase62(id);

      try {
        const url = await createShortenUrl({ ...params, id, short });

        return c.json({ data: url } satisfies ShortenUrlResponseApi, 201);
      } catch (err) {
        if (
          err instanceof Prisma.PrismaClientKnownRequestError &&
          err.code === "P2002"
        ) {
          throw new HTTPException(409, {
            message: "Short URL collision. Please retry.",
          });
        }
        throw err;
      }
    },
  )
  .get(
    "/:id",
    RedirectShortenUrlRoute(),
    validator("param", GetShortenUrlParamSchema),
    async (c) => {
      const id = c.req.valid("param").id;

      const url = await getShortenUrl(id);

      if (!url) {
        throw new HTTPException(404, { message: "URL not found" });
      }

      incrementShortenUrlClick(id).catch((err) => {
        c.get("logger").warn({ err, id }, "click increment failed");
      });

      return c.redirect(url, 302);
    },
  );
