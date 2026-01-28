import { Hono } from "hono";
import { csrf } from "hono/csrf";
import { secureHeaders } from "hono/secure-headers";
import { campaignsController } from "./features/campaigns/campaigns.controller.js";
import { shortenurlController } from "./features/shortenurl/shortenurl.controller.js";
import { errorHandler } from "./helpers/errors.js";
import { pinoServerLogger } from "./libs/pino.js";

const app = new Hono()
  .use(pinoServerLogger())
  .use(secureHeaders())
  .use(
    csrf({
      origin: [process.env.FRONTEND_URL || "http://localhost:5173"],
    }),
  )
  .route("/u", shortenurlController)
  .route("/campaigns", campaignsController)
  .onError(errorHandler);

export default app;
