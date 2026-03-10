export type { GetUrlsQuery } from "@urlshortener/common/types";

export type CreateUrl = {
	id: string;
	name: string;
	description: string;
	original: string;
	short: string;
	groupId: string;
};
