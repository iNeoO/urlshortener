import { URL_DIMENSION_TYPE } from "@urlshortener/common/constants";
import { prisma } from "@urlshortener/db";
import { pinoLogger } from "@urlshortener/infra/libs";

const logger = pinoLogger.child({ script: "createRandomStats" });

const DAY_MS = 24 * 60 * 60 * 1000;
const HOUR_MS = 60 * 60 * 1000;

const BROWSERS = ["Chrome", "Safari", "Firefox", "Edge"];
const OS_LIST = ["Windows", "macOS", "iOS", "Android", "Linux"];
const DEVICES = ["desktop", "mobile", "tablet"];
const REFERRERS = ["google.com", "linkedin.com", "github.com", "direct"];

const toUtcHourWindow = (date: Date) => {
	const d = new Date(date);
	d.setUTCMinutes(0, 0, 0);
	return d;
};

const toUtcDayWindow = (date: Date) => {
	const d = new Date(date);
	d.setUTCHours(0, 0, 0, 0);
	return d;
};

const randomInt = (min: number, max: number) =>
	Math.floor(Math.random() * (max - min + 1)) + min;

const pickPeakIndexes = (size: number, peakCount: number) => {
	const peaks = new Set<number>();
	while (peaks.size < Math.min(size, peakCount)) {
		peaks.add(randomInt(0, size - 1));
	}
	return peaks;
};

const createSeries = (
	size: number,
	baseMin: number,
	baseMax: number,
	peakMin: number,
	peakMax: number,
	peakCount: number,
) => {
	const peaks = pickPeakIndexes(size, peakCount);
	return Array.from({ length: size }, (_, index) => {
		const baseline = randomInt(baseMin, baseMax);
		const peakBoost = peaks.has(index) ? randomInt(peakMin, peakMax) : 0;
		return baseline + peakBoost;
	});
};

const distributeCount = (total: number, labels: string[]) => {
	const weights = labels.map(() => 0.5 + Math.random() * 2.5);
	const weightSum = weights.reduce((acc, value) => acc + value, 0);
	let remaining = total;

	return labels.map((label, index) => {
		if (index === labels.length - 1) {
			return { label, count: remaining };
		}

		const count = Math.max(
			0,
			Math.round((total * weights[index]) / weightSum),
		);
		remaining -= count;
		return { label, count };
	});
};

const upsertClickRows = async (
	urlId: string,
	windows: Date[],
	counts: number[],
	target: "hour" | "day",
) => {
	for (let index = 0; index < windows.length; index += 1) {
		const window = windows[index];
		const count = counts[index];

		if (target === "hour") {
			await prisma.urlHourCount.upsert({
				where: { urlId_window: { urlId, window } },
				update: { count },
				create: { urlId, window, count },
			});
		} else {
			await prisma.urlDayCount.upsert({
				where: { urlId_window: { urlId, window } },
				update: { count },
				create: { urlId, window, count },
			});
		}
	}
};

const upsertDimensionRows = async (
	urlId: string,
	window: Date,
	total: number,
	target: "hour" | "day",
) => {
	const groups = [
		{ type: URL_DIMENSION_TYPE.BROWSER, labels: BROWSERS },
		{ type: URL_DIMENSION_TYPE.OS, labels: OS_LIST },
		{ type: URL_DIMENSION_TYPE.DEVICE, labels: DEVICES },
		{ type: URL_DIMENSION_TYPE.REFERRER, labels: REFERRERS },
	] as const;

	for (const group of groups) {
		const distribution = distributeCount(total, [...group.labels]);
		for (const entry of distribution) {
			if (target === "hour") {
				await prisma.urlDimensionHourCount.upsert({
					where: {
						urlId_window_type_value: {
							urlId,
							window,
							type: group.type,
							value: entry.label,
						},
					},
					update: { count: entry.count },
					create: {
						urlId,
						window,
						type: group.type,
						value: entry.label,
						count: entry.count,
					},
				});
			} else {
				await prisma.urlDimensionDayCount.upsert({
					where: {
						urlId_window_type_value: {
							urlId,
							window,
							type: group.type,
							value: entry.label,
						},
					},
					update: { count: entry.count },
					create: {
						urlId,
						window,
						type: group.type,
						value: entry.label,
						count: entry.count,
					},
				});
			}
		}
	}
};

const buildLast24HourWindows = () => {
	const currentHour = toUtcHourWindow(new Date());
	return Array.from({ length: 24 }, (_, index) =>
		new Date(currentHour.getTime() - (23 - index) * HOUR_MS),
	);
};

const buildLast30DayWindows = () => {
	const currentDay = toUtcDayWindow(new Date());
	return Array.from({ length: 30 }, (_, index) =>
		new Date(currentDay.getTime() - (29 - index) * DAY_MS),
	);
};

const getUrlIdFromArgs = () => {
	const [, , ...args] = process.argv;
	const urlIdArg = args.find((arg) => !arg.startsWith("--"));
	const namedUrlIdArg = args.find((arg) => arg.startsWith("--urlId="));

	if (urlIdArg) {
		return urlIdArg;
	}

	if (namedUrlIdArg) {
		return namedUrlIdArg.slice("--urlId=".length);
	}

	return undefined;
};

const main = async () => {
	const urlId = getUrlIdFromArgs();

	if (!urlId) {
		logger.error(
			'Usage: pnpm run script:create-random-stats -- <urlId> or pnpm --filter @urlshortener/scripts create-random-stats --urlId=<urlId>',
		);
		process.exitCode = 1;
		return;
	}

	const url = await prisma.url.findFirst({
		where: {
			id: urlId,
			deletedAt: null,
		},
		select: { id: true, short: true },
	});

	if (!url) {
		logger.error({ urlId }, "Active URL not found. Random stats generation skipped");
		process.exitCode = 1;
		return;
	}

	const hourWindows = buildLast24HourWindows();
	const dayWindows = buildLast30DayWindows();

	logger.info(
		{
			urlId: url.id,
			short: url.short,
			hourWindows: hourWindows.length,
			dayWindows: dayWindows.length,
		},
		"Generating random stats for URL",
	);

	const hourlyCounts = createSeries(24, 5, 45, 40, 140, 3);
	const dailyCounts = createSeries(30, 50, 260, 150, 700, 4);

	await upsertClickRows(url.id, hourWindows, hourlyCounts, "hour");
	await upsertClickRows(url.id, dayWindows, dailyCounts, "day");

	for (let index = 0; index < hourWindows.length; index += 1) {
		await upsertDimensionRows(
			url.id,
			hourWindows[index],
			hourlyCounts[index],
			"hour",
		);
	}

	for (let index = 0; index < dayWindows.length; index += 1) {
		await upsertDimensionRows(
			url.id,
			dayWindows[index],
			dailyCounts[index],
			"day",
		);
	}

	logger.info({ urlId: url.id, short: url.short }, "Random stats generated for URL");

	logger.info("Random stats generation completed");
};

main()
	.catch((error) => {
		logger.error({ err: error }, "Random stats generation failed");
		process.exitCode = 1;
	})
	.finally(async () => {
		await prisma.$disconnect();
	});
