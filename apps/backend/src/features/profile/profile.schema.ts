import { PatchProfileMeJsonSchema } from "@urlshortener/common/schema";
import { z } from "zod";

export const ProfileSchema = z.object({
	id: z.string(),
	name: z.string(),
	email: z.email(),
	emailVerified: z.boolean(),
	createdAt: z.string(),
	updatedAt: z.string(),
});

export const ProfileGroupSchema = z.object({
	id: z.string(),
	name: z.string(),
	role: z.string(),
});

export const ProfileGroupsSchema = z.array(ProfileGroupSchema);

export { PatchProfileMeJsonSchema };
