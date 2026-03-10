import { pinoLogger } from "@urlshortener/infra/libs";
import { startConsumer } from "./consumer.js";
import { createContainer } from "./container.js";

const start = async () => {
	const container = createContainer();
	await container.init();
	await startConsumer({
		handleMailMessage: container.handleMailMessage,
		shutdown: container.shutdown,
	});
};

start().catch((error) => {
	pinoLogger.error({ err: error }, "Mail worker startup failed");
	process.exitCode = 1;
});
