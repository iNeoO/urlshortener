import type { z } from "zod";
import type { GroupMemberSchema } from "../groups.schema.js";
import type {
	GetGroupInvitationsResponseSchema,
	GetInvitationsResponseSchema,
	PostInvitationResponseSchema,
} from "./invitations.schema.js";

type GetInvitationsResponse = z.infer<typeof GetInvitationsResponseSchema>;
type Invitation = Omit<
	GetInvitationsResponse[number],
	"acceptedAt" | "revokedAt" | "refusedAt" | "expiresAt" | "createdAt"
> & {
	acceptedAt: Date | null;
	revokedAt: Date | null;
	refusedAt: Date | null;
	expiresAt: Date;
	createdAt: Date;
};

export type GetInvitationsResponseApi = {
	data: Invitation[];
};

type GetGroupInvitationsResponse = z.infer<
	typeof GetGroupInvitationsResponseSchema
>;
type GroupInvitation = Omit<
	GetGroupInvitationsResponse[number],
	"acceptedAt" | "revokedAt" | "refusedAt" | "expiresAt" | "createdAt"
> & {
	acceptedAt: Date | null;
	revokedAt: Date | null;
	refusedAt: Date | null;
	expiresAt: Date;
	createdAt: Date;
};

export type GetGroupInvitationsResponseApi = {
	data: GroupInvitation[];
};

type PostInvitationResponse = z.infer<typeof PostInvitationResponseSchema>;
type PostInvitation = Omit<
	PostInvitationResponse,
	"acceptedAt" | "revokedAt" | "refusedAt" | "expiresAt" | "createdAt"
> & {
	acceptedAt: Date | null;
	revokedAt: Date | null;
	refusedAt: Date | null;
	expiresAt: Date;
	createdAt: Date;
};

export type PostInvitationResponseApi = {
	data: PostInvitation;
};

export type RefuseInvitationResponseApi = {
	data: PostInvitation;
};

type GroupMemberResponse = z.infer<typeof GroupMemberSchema>;
type GroupMember = Omit<GroupMemberResponse, "createdAt"> & {
	createdAt: Date;
};

export type AcceptInvitationResponseApi = {
	data: GroupMember;
};
