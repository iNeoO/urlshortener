import type { GetGroupsQuery } from "@urlshortener/common/types";

export const ALLOWED_GROUP_SORTS: readonly NonNullable<
	GetGroupsQuery["sort"]
>[] = ["createdAt", "name", "description", "role", "totalUrls", "totalUsers"];
