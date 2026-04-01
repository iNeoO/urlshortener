import type { Role, UrlClickMessage } from "@urlshortener/common/types";

export type IncrementAfterClickParams = {
	short: string;
	bucketKey: string;
	message: UrlClickMessage;
};

export type HashValues = Record<string, string | number>;
export type ReadonlyHashValues = Record<string, string>;

export type CachedGroupsPayload = {
	version: number;
	data: Array<{
		id: string;
		name: string;
		role: Role;
	}>;
};

export type SetCachedShortUrlParams = {
	short: string;
	original: string;
	ttlSeconds: number;
};
