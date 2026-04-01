import type { z } from "zod";
import type { GetUrlsQuerySchema } from "../schema/urls.schema.js";

export type GetUrlsQuery = z.infer<typeof GetUrlsQuerySchema>;
