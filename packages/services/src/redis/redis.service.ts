import {
	CachedGroupsPayloadSchema,
	CachedShortUrlSchema,
} from "@urlshortener/common/schema";
import {
	getBrowserKey,
	getClickCountKey,
	getClickCountLockKey,
	getDeviceKey,
	getGroupsKey,
	getOsKey,
	getReferrerKey,
	getUrlKey,
	type RedisClient,
} from "@urlshortener/infra/redis";

import type {
	CachedGroupsPayload,
	HashValues,
	IncrementAfterClickParams,
	ReadonlyHashValues,
	SetCachedShortUrlParams,
} from "./redis.type.js";

import { incrementHash, normalizeReferrer } from "./redis.util.js";
export class RedisService {
	private redisClient: RedisClient;

	constructor(redisClient: RedisClient) {
		this.redisClient = redisClient;
	}

	private async getValues(key: string): Promise<ReadonlyHashValues> {
		return await this.redisClient.hgetall(key);
	}

	async getCachedGroups(userId: string) {
		const cached = await this.redisClient.get(getGroupsKey(userId));
		if (!cached) {
			return null;
		}
		return CachedGroupsPayloadSchema.parse(JSON.parse(cached));
	}

	async setCachedGroups(userId: string, payload: CachedGroupsPayload) {
		const parsed = CachedGroupsPayloadSchema.parse(payload);
		await this.redisClient.set(getGroupsKey(userId), JSON.stringify(parsed));
	}

	async deleteCachedGroups(userId: string) {
		await this.redisClient.del(getGroupsKey(userId));
	}

	async getCachedShortUrl(short: string) {
		const cached = await this.redisClient.get(getUrlKey(short));
		if (!cached) {
			return null;
		}
		return CachedShortUrlSchema.parse(cached);
	}

	async setCachedShortUrl({
		short,
		original,
		ttlSeconds,
	}: SetCachedShortUrlParams) {
		const parsed = CachedShortUrlSchema.parse(original);
		await this.redisClient.set(getUrlKey(short), parsed, "EX", ttlSeconds);
	}

	async acquireClickCountLock(bucketKey: string) {
		const lockKey = getClickCountLockKey(bucketKey);
		return await this.redisClient.set(lockKey, "1", "PX", 55_000, "NX");
	}

	async releaseClickCountLock(bucketKey: string) {
		await this.redisClient.del(getClickCountLockKey(bucketKey));
	}

	async getClickCountEntries(bucketKey: string) {
		return await this.redisClient.hgetall(getClickCountKey(bucketKey));
	}

	async getDimensionHashesForShorts(shorts: string[], bucketKey: string) {
		const [browserHashes, osHashes, deviceHashes, referrerHashes] =
			await Promise.all([
				Promise.all(
					shorts.map((short) =>
						this.redisClient.hgetall(getBrowserKey(short, bucketKey)),
					),
				),
				Promise.all(
					shorts.map((short) =>
						this.redisClient.hgetall(getOsKey(short, bucketKey)),
					),
				),
				Promise.all(
					shorts.map((short) =>
						this.redisClient.hgetall(getDeviceKey(short, bucketKey)),
					),
				),
				Promise.all(
					shorts.map((short) =>
						this.redisClient.hgetall(getReferrerKey(short, bucketKey)),
					),
				),
			]);

		return {
			browserHashes,
			osHashes,
			deviceHashes,
			referrerHashes,
		};
	}

	async clearAggregatedClickKeys(bucketKey: string, shorts: string[]) {
		const keysToDelete = [
			getClickCountKey(bucketKey),
			...shorts.map((short) => getBrowserKey(short, bucketKey)),
			...shorts.map((short) => getOsKey(short, bucketKey)),
			...shorts.map((short) => getDeviceKey(short, bucketKey)),
			...shorts.map((short) => getReferrerKey(short, bucketKey)),
		];
		await this.redisClient.del(...keysToDelete);
		await this.releaseClickCountLock(bucketKey);
	}

	private async setValues(
		key: string,
		values: HashValues,
		ttlSeconds?: number,
	): Promise<void> {
		if (Object.keys(values).length === 0) {
			return;
		}

		const pipeline = this.redisClient.multi();
		pipeline.hset(key, values);

		if (ttlSeconds) {
			pipeline.expire(key, ttlSeconds);
		}

		await pipeline.exec();
	}

	async getBrowsers(short: string, bucketKey: string) {
		return await this.getValues(getBrowserKey(short, bucketKey));
	}

	async getOs(short: string, bucketKey: string) {
		return await this.getValues(getOsKey(short, bucketKey));
	}

	async getDevices(short: string, bucketKey: string) {
		return await this.getValues(getDeviceKey(short, bucketKey));
	}

	async getReferrers(short: string, bucketKey: string) {
		return await this.getValues(getReferrerKey(short, bucketKey));
	}

	async setBrowsers(
		short: string,
		bucketKey: string,
		values: HashValues,
		ttlSeconds?: number,
	) {
		await this.setValues(getBrowserKey(short, bucketKey), values, ttlSeconds);
	}

	async setOs(
		short: string,
		bucketKey: string,
		values: HashValues,
		ttlSeconds?: number,
	) {
		await this.setValues(getOsKey(short, bucketKey), values, ttlSeconds);
	}

	async setDevices(
		short: string,
		bucketKey: string,
		values: HashValues,
		ttlSeconds?: number,
	) {
		await this.setValues(getDeviceKey(short, bucketKey), values, ttlSeconds);
	}

	async setReferrers(
		short: string,
		bucketKey: string,
		values: HashValues,
		ttlSeconds?: number,
	) {
		await this.setValues(getReferrerKey(short, bucketKey), values, ttlSeconds);
	}

	async incrementAfterClick({
		short,
		bucketKey,
		message,
	}: IncrementAfterClickParams) {
		const clickCountKey = getClickCountKey(bucketKey);
		const referrerKey = getReferrerKey(short, bucketKey);
		const browserKey = getBrowserKey(short, bucketKey);
		const osKey = getOsKey(short, bucketKey);
		const deviceKey = getDeviceKey(short, bucketKey);

		const referrerDimension = normalizeReferrer(message.referrer);

		const pipeline = this.redisClient.multi();

		incrementHash(pipeline, clickCountKey, message.short);
		incrementHash(pipeline, referrerKey, referrerDimension);
		incrementHash(pipeline, browserKey, message.browserDimension);
		incrementHash(pipeline, osKey, message.osDimension);
		incrementHash(pipeline, deviceKey, message.deviceDimension);

		await pipeline.exec();
	}
}
