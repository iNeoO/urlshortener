import type { GetUrlsQuery } from "@urlshortener/common/types";

export const ALLOWED_URL_SORTS: readonly NonNullable<GetUrlsQuery["sort"]>[] = [
	"createdAt",
	"name",
	"description",
	"original",
	"short",
];
