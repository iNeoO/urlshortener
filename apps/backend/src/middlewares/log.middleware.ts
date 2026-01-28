import { createFactory } from "hono/factory";
import { loggerStorage } from "../helpers/asyncLocalStorage.js";
import type { LogsBindings } from "../helpers/factories/appWithLogs.js";

const factory = createFactory<LogsBindings>();

factory.createMiddleware(async (c, next) => {
	const logger = c.get("logger");

	await loggerStorage.run(logger, async () => {
		await next();
	});
});
