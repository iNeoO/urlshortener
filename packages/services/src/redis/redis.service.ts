import {
	CachedGroupsPayloadSchema,
	CachedShortUrlSchema,
} from "@urlshortener/common/schema";
import {
	createRedisKeyGenerator,
	type RedisClient,
	type RedisKeyGenerator,
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
	private keys: RedisKeyGenerator;

	constructor(redisClient: RedisClient, keyPrefix: string) {
		this.redisClient = redisClient;
		this.keys = createRedisKeyGenerator(keyPrefix);
	}

	private async getValues(key: string): Promise<ReadonlyHashValues> {
		return await this.redisClient.hgetall(key);
	}

	async getCachedGroups(userId: string) {
		const cached = await this.redisClient.get(this.keys.groups(userId));
		if (!cached) {
			return null;
		}
		return CachedGroupsPayloadSchema.parse(JSON.parse(cached));
	}

	async setCachedGroups(userId: string, payload: CachedGroupsPayload) {
		const parsed = CachedGroupsPayloadSchema.parse(payload);
		await this.redisClient.set(
			this.keys.groups(userId),
			JSON.stringify(parsed),
		);
	}

	async deleteCachedGroups(userId: string) {
		await this.redisClient.del(this.keys.groups(userId));
	}

	async getCachedShortUrl(short: string) {
		const cached = await this.redisClient.get(this.keys.url(short));
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
		await this.redisClient.set(this.keys.url(short), parsed, "EX", ttlSeconds);
	}

	async acquireClickCountLock(bucketKey: string) {
		const lockKey = this.keys.clickCountLock(bucketKey);
		return await this.redisClient.set(lockKey, "1", "PX", 55_000, "NX");
	}

	async releaseClickCountLock(bucketKey: string) {
		await this.redisClient.del(this.keys.clickCountLock(bucketKey));
	}

	async getClickCountEntries(bucketKey: string) {
		return await this.redisClient.hgetall(this.keys.clickCount(bucketKey));
	}

	async getDimensionHashesForShorts(shorts: string[], bucketKey: string) {
		const [browserHashes, osHashes, deviceHashes, referrerHashes] =
			await Promise.all([
				Promise.all(
					shorts.map((short) =>
						this.redisClient.hgetall(this.keys.browser(short, bucketKey)),
					),
				),
				Promise.all(
					shorts.map((short) =>
						this.redisClient.hgetall(this.keys.os(short, bucketKey)),
					),
				),
				Promise.all(
					shorts.map((short) =>
						this.redisClient.hgetall(this.keys.device(short, bucketKey)),
					),
				),
				Promise.all(
					shorts.map((short) =>
						this.redisClient.hgetall(this.keys.referrer(short, bucketKey)),
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
			this.keys.clickCount(bucketKey),
			...shorts.map((short) => this.keys.browser(short, bucketKey)),
			...shorts.map((short) => this.keys.os(short, bucketKey)),
			...shorts.map((short) => this.keys.device(short, bucketKey)),
			...shorts.map((short) => this.keys.referrer(short, bucketKey)),
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
		return await this.getValues(this.keys.browser(short, bucketKey));
	}

	async getOs(short: string, bucketKey: string) {
		return await this.getValues(this.keys.os(short, bucketKey));
	}

	async getDevices(short: string, bucketKey: string) {
		return await this.getValues(this.keys.device(short, bucketKey));
	}

	async getReferrers(short: string, bucketKey: string) {
		return await this.getValues(this.keys.referrer(short, bucketKey));
	}

	async setBrowsers(
		short: string,
		bucketKey: string,
		values: HashValues,
		ttlSeconds?: number,
	) {
		await this.setValues(
			this.keys.browser(short, bucketKey),
			values,
			ttlSeconds,
		);
	}

	async setOs(
		short: string,
		bucketKey: string,
		values: HashValues,
		ttlSeconds?: number,
	) {
		await this.setValues(this.keys.os(short, bucketKey), values, ttlSeconds);
	}

	async setDevices(
		short: string,
		bucketKey: string,
		values: HashValues,
		ttlSeconds?: number,
	) {
		await this.setValues(
			this.keys.device(short, bucketKey),
			values,
			ttlSeconds,
		);
	}

	async setReferrers(
		short: string,
		bucketKey: string,
		values: HashValues,
		ttlSeconds?: number,
	) {
		await this.setValues(
			this.keys.referrer(short, bucketKey),
			values,
			ttlSeconds,
		);
	}

	async incrementAfterClick({
		short,
		bucketKey,
		message,
	}: IncrementAfterClickParams) {
		const clickCountKey = this.keys.clickCount(bucketKey);
		const referrerKey = this.keys.referrer(short, bucketKey);
		const browserKey = this.keys.browser(short, bucketKey);
		const osKey = this.keys.os(short, bucketKey);
		const deviceKey = this.keys.device(short, bucketKey);

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
