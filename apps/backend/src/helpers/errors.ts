import type { ErrorHandler } from "hono";
import { HTTPException } from "hono/http-exception";
import { z } from "zod";
import type { LogsBindings } from "./factories/appWithLogs.js";

export const errorHandler: ErrorHandler<LogsBindings> = (err, c) => {
	if (err instanceof HTTPException) {
		return err.getResponse();
	}

	const logger = c.get("logger");
	logger.error({ err }, "Internal server error");

	return c.json({ message: "Internal server error" }, 500);
};

export const ErrorSchema = z.object({
	message: z.string(),
});

const ZodIssueSchema = z.object({
	code: z.string(),
	path: z.array(z.union([z.string(), z.number()])),
	message: z.string(),
	expected: z.any().optional(),
	received: z.any().optional(),
	minimum: z.number().optional(),
	maximum: z.number().optional(),
	inclusive: z.boolean().optional(),
	multipleOf: z.number().optional(),
	unionErrors: z.array(z.unknown()).optional(),
});

export const ZodErrorSchema = z.object({
	issues: z.array(ZodIssueSchema),
	name: z.string(),
});

export const ZodSafeParseErrorSchema = z.object({
	error: ZodErrorSchema,
	success: z.boolean(),
});
