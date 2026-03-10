import { z } from "zod";

export const GetShortenUrlParamSchema = z.object({
	id: z.string(),
});
