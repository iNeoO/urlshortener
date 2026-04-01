import type { z } from "zod";

import type {
	GetGroupInvitationsQuerySchema,
	GetInvitationsQuerySchema,
} from "../schema/invitations.schema.js";

export type GetInvitationsQuery = z.infer<typeof GetInvitationsQuerySchema>;
export type GetGroupInvitationsQuery = z.infer<
	typeof GetGroupInvitationsQuerySchema
>;
