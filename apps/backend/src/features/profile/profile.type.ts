import type { z } from "zod";
import type {
	PatchProfileMeJsonSchema,
	ProfileGroupsSchema,
	ProfileSchema,
} from "./profile.schema.js";

type ProfileResponse = z.infer<typeof ProfileSchema>;
type Profile = Omit<ProfileResponse, "createdAt" | "updatedAt"> & {
	createdAt: Date;
	updatedAt: Date;
};

export type ProfileResponseApi = { data: Profile };
export type PatchProfileBody = z.infer<typeof PatchProfileMeJsonSchema>;

export type ProfileGroupsResponseApi = {
	data: z.infer<typeof ProfileGroupsSchema>;
};
