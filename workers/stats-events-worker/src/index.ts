import { pinoLogger } from "@urlshortener/infra/libs";
import { startConsumer } from "./consumer.js";
import { createContainer } from "./container.js";

const start = async () => {
	const container = createContainer();
	await container.init();
	await startConsumer({
		handleUrlClickedEvent: container.handleUrlClickedEvent,
		shutdown: container.shutdown,
	});
};

start().catch((error) => {
	pinoLogger.error({ err: error }, "Stats worker startup failed");
	process.exitCode = 1;
});
