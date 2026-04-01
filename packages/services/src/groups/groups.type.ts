import type {
	GetGroupMembersQuery,
	GetGroupsQuery,
	GetGroupUrlsQuery,
	Role,
} from "@urlshortener/common/types";

export type { GetGroupsQuery, GetGroupMembersQuery, GetGroupUrlsQuery };

export type CachedGroup = {
	id: string;
	name: string;
	role: Role;
};

export type CachedGroupsPayload = {
	version: number;
	data: CachedGroup[];
};
