import process from "node:process";
import { loggerStorage, pinoLogger } from "@urlshortener/infra/libs";
import { fetchRedirection } from "./createCalls/fetchRedirection.ts";

const abortController = new AbortController();
let intervalId: NodeJS.Timeout;
const startedAtMs = Date.now();
const TICK_MS = 500;
const TRAFFIC_CYCLE_SECONDS = 90;
const BURST_PROBABILITY = 0.08;

const logger = pinoLogger.child({ script: "createCalls" });

const getCallsCountForTick = () => {
	const elapsedSeconds = (Date.now() - startedAtMs) / 1000;
	const phase =
		(elapsedSeconds % TRAFFIC_CYCLE_SECONDS) / TRAFFIC_CYCLE_SECONDS;
	const wave = (Math.sin(phase * Math.PI * 2) + 1) / 2; // 0..1

	const baseline = 1 + wave * 7; // 1..8
	const jitter = 0.7 + Math.random() * 0.8; // 0.7..1.5
	const burstMultiplier =
		Math.random() < BURST_PROBABILITY ? 1.8 + Math.random() * 1.2 : 1;

	return Math.max(0, Math.round(baseline * jitter * burstMultiplier));
};

export const createCalls = async (url: string) => {
	intervalId = setInterval(() => {
		const calls = [];
		const count = getCallsCountForTick();

		for (let i = 0; i < count; i++) {
			calls.push(fetchRedirection(url, abortController));
		}
		Promise.all(calls);
	}, TICK_MS);
};

const gracefulShutdown = (signal: string) => {
	logger.info(`Received ${signal}. Shutting down gracefully...`);
	abortController.abort();
	clearInterval(intervalId);
	process.exit(0);
};

process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
process.on("SIGINT", () => gracefulShutdown("SIGINT"));

const main = async () => {
	const url = process.argv[2];
	if (!url) {
		console.error("Please provide a URL as an argument");
		process.exit(1);
	}
	loggerStorage.run(pinoLogger, async () => {
		logger.info(`Starting to create calls to ${url}`);

		await createCalls(url);
	});
};

main();
