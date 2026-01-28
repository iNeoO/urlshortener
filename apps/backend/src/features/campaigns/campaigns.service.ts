import { Prisma, prisma } from "@urlshortener/db";
import { getLoggerStore } from "../../helpers/asyncLocalStorage.js";
import { toMinuteWindow } from "./campagins.utils.js";
import type { GetCampaignsParams } from "./campaigns.type.js";

export const createUrlWindowCountsFromShorts = async (
  entries: Array<[string, string]>,
  window: Date,
) => {
  if (entries.length === 0) {
    return { created: 0, missing: 0 };
  }

  const shorts = entries.map(([short]) => short);
  const urls = await prisma.url.findMany({
    where: { short: { in: shorts }, deletedAt: null },
    select: { id: true, short: true },
  });

  const idByShort = new Map(urls.map((url) => [url.short, url.id]));

  const rows = entries.flatMap(([short, count]) => {
    const urlId = idByShort.get(short);
    if (!urlId) {
      return [];
    }
    return [{ urlId, window, count: Number(count) }];
  });

  if (rows.length > 0) {
    try {
      await prisma.urlWindowCount.createMany({ data: rows });
    } catch (err) {
      const logger = getLoggerStore();
      if (err instanceof Prisma.PrismaClientValidationError) {
        logger.warn(
          { err, window: window.toISOString(), rows: rows.length },
          "[Worker] Duplicate (urlId, window) detected. Skipping duplicates.",
        );
        await prisma.urlWindowCount.createMany({
          data: rows,
          skipDuplicates: true,
        });
      } else {
        logger.error({ err }, "[Worker] Failed to create url window counts");
        throw err;
      }
    }
  }

  return { created: rows.length, missing: entries.length - rows.length };
};

export const getCountFromCampaign = async (urlIds: string[]) => {
  if (urlIds.length === 0) {
    return new Map<string, number>();
  }
  const grouped = await prisma.urlWindowCount.groupBy({
    by: ["urlId"],
    where: { urlId: { in: urlIds } },
    _sum: { count: true },
  });
  return new Map(grouped.map((row) => [row.urlId, row._sum.count ?? 0]));
};

export const getClicksLastHourByMinute = async () => {
  const now = toMinuteWindow(new Date());
  const since = new Date(now.getTime() - 60 * 60 * 1000);
  const grouped = await prisma.urlWindowCount.groupBy({
    by: ["window"],
    where: {
      window: { gte: since, lt: now },
      url: { deletedAt: null },
    },
    _sum: { count: true },
    orderBy: { window: "asc" },
  });

  const countsByWindow = new Map(
    grouped.map((row) => [row.window.getTime(), row._sum.count ?? 0]),
  );

  const data = Array.from({ length: 60 }, (_, index) => {
    const window = new Date(since.getTime() + index * 60_000);
    const count = countsByWindow.get(window.getTime()) ?? 0;
    return { window, count };
  });

  return data;
};

export const getCampaigns = async ({
  limit = 10,
  offset = 0,
  order = "desc",
  sort = "createdAt",
  search,
}: GetCampaignsParams) => {
  const where = {
    deletedAt: null,
    ...(search
      ? {
          OR: [
            { name: { contains: search, mode: "insensitive" as const } },
            {
              description: { contains: search, mode: "insensitive" as const },
            },
          ],
        }
      : {}),
  };

  const [total, urls] = await prisma.$transaction([
    prisma.url.count({ where }),
    prisma.url.findMany({
      where,
      orderBy: { [sort]: order },
      skip: offset,
      take: limit,
      select: {
        id: true,
        name: true,
        description: true,
        original: true,
        short: true,
        createdAt: true,
      },
    }),
  ]);

  if (urls.length === 0) {
    return { data: [], total };
  }

  const urlIds = urls.map((url) => url.id);
  const clicksById = await getCountFromCampaign(urlIds);

  const data = urls.map((url) => ({
    ...url,
    totalClicks: clicksById.get(url.id) ?? 0,
  }));

  return { data, total };
};
