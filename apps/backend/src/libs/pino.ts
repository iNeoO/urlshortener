import { pinoLogger as logger } from "hono-pino";
import pino from "pino";
import pretty from "pino-pretty";

const createServerConfig = (): pino.LoggerOptions => {
	return {
		level: "info",
		serializers: {
			err: pino.stdSerializers.err,
			req: (req: { method: string; url: string }) => ({
				method: req.method,
				url: req.url,
			}),
			res: (res: { status: number }) => ({
				status: res.status,
			}),
		},
	};
};

const createDefaultConfig = (): pino.LoggerOptions => {
	return {
		level: "info",
		serializers: {
			err: pino.stdSerializers.err,
		},
	};
};

export const pinoLogger = pino(createDefaultConfig(), pretty());

export function pinoServerLogger() {
	return logger({
		pino: pino(createServerConfig(), pretty()),
	});
}
