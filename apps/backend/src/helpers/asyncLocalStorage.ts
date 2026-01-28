import { AsyncLocalStorage } from "async_hooks";
import type { Logger } from "pino";
import type { PinoLogger } from "hono-pino";

export const loggerStorage = new AsyncLocalStorage<PinoLogger | Logger>();

export const getLoggerStore = () => {
	const logger = loggerStorage.getStore();
	if (!logger) {
		throw new Error("Logger not found in AsyncLocalStorage");
	}
	return logger;
};
