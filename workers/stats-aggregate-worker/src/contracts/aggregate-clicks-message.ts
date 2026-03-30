import { z } from "zod";

export const aggregateClicksMessageSchema = z.object({
	type: z.enum([
		"stats.aggregate-minute",
		"stats.aggregate-hour",
		"stats.aggregate-day",
	]),
	occurredAt: z.number().int().nonnegative(),
});

export type AggregateClicksMessage = z.infer<
	typeof aggregateClicksMessageSchema
>;

export const parseRawMessage = (raw: Buffer): AggregateClicksMessage => {
	const data = JSON.parse(raw.toString("utf-8"));
	return aggregateClicksMessageSchema.parse(data);
};
