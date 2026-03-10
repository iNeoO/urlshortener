import process from "node:process";
import { env } from "@urlshortener/infra/configs";
import { loggerStorage, pinoLogger } from "@urlshortener/infra/libs";
import { Queue, Worker } from "bullmq";
import { createContainer } from "./container.js";

const QUEUE_NAME = "stats.aggregate";
const JOB_NAME = "aggregate-clicks";
const REPEAT_EVERY_MS = 10_000;

const connection = {
	host: env.REDIS_URLSHORTENER_HOST,
	port: env.REDIS_URLSHORTENER_PORT,
	...(env.REDIS_URLSHORTENER_USERNAME
		? { username: env.REDIS_URLSHORTENER_USERNAME }
		: {}),
	password: env.REDIS_URLSHORTENER_PASSWORD,
};

const queue = new Queue(QUEUE_NAME, { connection });
const workerLogger = pinoLogger.child({
	from: "worker",
	worker: "stats-aggregate",
});

const container = createContainer();
await container.init();

const worker = new Worker(
	QUEUE_NAME,
	async () => {
		await loggerStorage.run(workerLogger, async () => {
			try {
				await container.aggregateClicks();
			} catch (error) {
				workerLogger.error({ err: error }, "aggregateClicks failed");
				throw error;
			}
		});
	},
	{ connection, concurrency: 1 },
);

await queue.add(
	JOB_NAME,
	{},
	{
		jobId: JOB_NAME,
		repeat: {
			every: REPEAT_EVERY_MS,
		},
		removeOnComplete: 200,
		removeOnFail: 200,
	},
);

workerLogger.info(
	{ queue: QUEUE_NAME, everyMs: REPEAT_EVERY_MS },
	"Stats aggregate worker is running",
);

const close = async (signal: string) => {
	workerLogger.info({ signal }, "Shutting down stats aggregate worker");
	await worker.close();
	await queue.close();
	await container.shutdown();
	process.exit(0);
};

process.on("SIGINT", () => {
	void close("SIGINT");
});
process.on("SIGTERM", () => {
	void close("SIGTERM");
});
