import { z } from "zod";

export const UrlClickMessageSchema = z.object({
	type: z.literal("stats.url-clicked"),
	short: z.string().min(1),
	referrer: z.string().optional(),
	browserDimension: z.string().min(1),
	osDimension: z.string().min(1),
	deviceDimension: z.string().min(1),
	occurredAt: z.number().int().positive().optional(),
});
