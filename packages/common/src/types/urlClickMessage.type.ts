import type { z } from "zod";
import type { UrlClickMessageSchema } from "../schema/urlClickMessage.schema.js";

export type UrlClickMessage = z.infer<typeof UrlClickMessageSchema>;
