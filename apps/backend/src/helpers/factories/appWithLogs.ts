import { createFactory } from "hono/factory";
import type { PinoLogger } from "hono-pino";

export type LogsBindings = {
	Variables: {
		logger: PinoLogger;
	};
};

export const appWithLogs = createFactory<LogsBindings>();
