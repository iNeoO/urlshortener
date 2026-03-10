import { z } from "zod";

const getInvitationsColuns = [
	"role",
	"expiresAt",
	"acceptedAt",
	"refusedAt",
	"status",
	"invitedBy.name",
	"createdAt",
] as const;

export const GetInvitationsQuerySchema = z.object({
	limit: z.coerce.number().int().min(1).max(100).default(10).optional(),
	offset: z.coerce.number().int().min(0).default(0).optional(),
	order: z.enum(["asc", "desc"]).default("desc").optional(),
	sort: z
		.enum(["group.name", ...getInvitationsColuns])
		.default("createdAt")
		.optional(),
	search: z.string().trim().min(1).optional(),
});

export const GetGroupInvitationsQuerySchema = z.object({
	limit: z.coerce.number().int().min(1).max(100).default(10).optional(),
	offset: z.coerce.number().int().min(0).default(0).optional(),
	order: z.enum(["asc", "desc"]).default("desc").optional(),
	sort: z.enum(getInvitationsColuns).default("createdAt").optional(),
	search: z.string().trim().min(1).optional(),
});
