import type { PatchProfileMeJsonSchema } from "@urlshortener/common/schema";
import type { z } from "zod";
import { client } from "../hc.ts";
import { toApiError } from "./apiError.ts";

export type UpdateProfileBody = z.infer<typeof PatchProfileMeJsonSchema>;

export async function getProfile() {
	const res = await client.profile.me.$get();

	if (!res.ok) {
		throw await toApiError(res, "Failed to fetch profile");
	}
	const json = await res.json();
	return json;
}

export async function updateProfile(body: UpdateProfileBody) {
	const res = await client.profile.me.$patch({
		json: body,
	});

	if (!res.ok) {
		throw await toApiError(res, "Failed to update profile");
	}
	const json = await res.json();
	return json;
}

export async function getProfileGroups() {
	const res = await client.profile.groups.$get();

	if (!res.ok) {
		throw await toApiError(res, "Failed to fetch profile groups");
	}
	const json = await res.json();
	return json;
}
