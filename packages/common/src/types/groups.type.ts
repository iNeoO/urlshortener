import type { z } from "zod";

import type {
	GetGroupMembersQuerySchema,
	GetGroupsQuerySchema,
	GetGroupUrlsQuerySchema,
} from "../schema/groups.schema.js";

export type GetGroupsQuery = z.infer<typeof GetGroupsQuerySchema>;
export type GetGroupMembersQuery = z.infer<typeof GetGroupMembersQuerySchema>;
export type GetGroupUrlsQuery = z.infer<typeof GetGroupUrlsQuerySchema>;
