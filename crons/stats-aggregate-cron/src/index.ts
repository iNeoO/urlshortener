import process from "node:process";
import cron from "node-cron";
import { pinoLogger } from "@urlshortener/infra/libs";
import { StatsAggregatePublisher } from "@urlshortener/stats-aggregate-worker/publisher";

const minuteSchedule =
	process.env.STATS_AGGREGATE_MINUTE_CRON_SCHEDULE ?? "10 * * * * *";
const hourSchedule =
	process.env.STATS_AGGREGATE_HOUR_CRON_SCHEDULE ?? "20 * * * *";
const daySchedule =
	process.env.STATS_AGGREGATE_DAY_CRON_SCHEDULE ?? "30 0 * * *";
const cronLogger = pinoLogger.child({
	from: "cron",
	cron: "stats-aggregate",
});

const start = async () => {
	const publisher = new StatsAggregatePublisher();
	let minuteRunning = false;
	let hourRunning = false;
	let dayRunning = false;

	const createTask = (
		name: "minute" | "hour" | "day",
		schedule: string,
		isRunningRef: () => boolean,
		setRunning: (value: boolean) => void,
		publish: (message?: { occurredAt?: number }) => Promise<void>,
	) =>
		cron.schedule(schedule, async () => {
			const taskLogger = cronLogger.child({ task: name, schedule });
			if (isRunningRef()) {
				taskLogger.warn("Skipping stats aggregate trigger because previous run is still in progress");
				return;
			}

			setRunning(true);
			const startedAt = Date.now();
			const runLogger = taskLogger.child({
				triggeredAt: new Date(startedAt).toISOString(),
			});

			try {
				runLogger.info("Publishing stats aggregate trigger");
				await publish({ occurredAt: startedAt });
				runLogger.info(
					{ durationMs: Date.now() - startedAt },
					"Stats aggregate trigger published",
				);
			} catch (error) {
				runLogger.error(
					{ err: error, durationMs: Date.now() - startedAt },
					"Failed to publish stats aggregate trigger",
				);
			} finally {
				setRunning(false);
			}
		});

	const tasks = [
		createTask(
			"minute",
			minuteSchedule,
			() => minuteRunning,
			(value) => {
				minuteRunning = value;
			},
			(message) => publisher.sendAggregateClicksEvent(message),
		),
		createTask(
			"hour",
			hourSchedule,
			() => hourRunning,
			(value) => {
				hourRunning = value;
			},
			(message) => publisher.sendAggregateHourlyClicksEvent(message),
		),
		createTask(
			"day",
			daySchedule,
			() => dayRunning,
			(value) => {
				dayRunning = value;
			},
			(message) => publisher.sendAggregateDailyClicksEvent(message),
		),
	];

	cronLogger.info(
		{
			minuteSchedule,
			hourSchedule,
			daySchedule,
		},
		"Stats aggregate cron is running",
	);

	const close = async (signal: string) => {
		cronLogger.info({ signal }, "Shutting down stats aggregate cron");
		for (const task of tasks) {
			task.stop();
		}
		await publisher.close();
		process.exit(0);
	};

	process.on("SIGINT", () => {
		void close("SIGINT");
	});
	process.on("SIGTERM", () => {
		void close("SIGTERM");
	});
};

start().catch((error) => {
	cronLogger.error({ err: error }, "Stats aggregate cron startup failed");
	process.exitCode = 1;
});
