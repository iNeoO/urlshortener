import { z } from "zod";

export const PatchProfileMeJsonSchema = z
	.object({
		name: z.string().trim().min(3).max(30).optional(),
		currentPassword: z.string().min(8).optional(),
		newPassword: z.string().min(8).optional(),
	})
	.refine(
		(data) => Boolean(data.name || data.currentPassword || data.newPassword),
		{
			message: "At least one field is required",
			path: ["name"],
		},
	)
	.refine(
		(data) =>
			(data.currentPassword && data.newPassword) ||
			(!data.currentPassword && !data.newPassword),
		{
			message: "currentPassword and newPassword must be provided together",
			path: ["currentPassword"],
		},
	);
