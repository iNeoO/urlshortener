import pino from "pino";
import pretty from "pino-pretty";

const createDefaultConfig = (): pino.LoggerOptions => {
	return {
		level: "info",
		serializers: {
			err: pino.stdSerializers.err,
		},
	};
};

export const pinoLogger = pino(createDefaultConfig(), pretty());

type HttpLogBindings = {
	reqId: string;
	req: {
		method: string;
		url: string;
	};
	userAgent: string;
};

export const createHttpLogger = (bindings: HttpLogBindings) =>
	pinoLogger.child(bindings);

export const logHttpCompletion = (
	logger: pino.Logger,
	status: number,
	responseTime: number,
) =>
	logger.info(
		{
			res: {
				status,
			},
			responseTime,
		},
		"Request completed",
	);
