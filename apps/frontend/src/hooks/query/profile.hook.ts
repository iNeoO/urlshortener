import {
	queryOptions,
	useMutation,
	useQuery,
	useQueryClient,
} from "@tanstack/react-query";
import {
	getProfile,
	getProfileGroups,
	type UpdateProfileBody,
	updateProfile,
} from "../../libs/api/profile.api";

export type User = Awaited<ReturnType<typeof getProfile>>["data"];
export type UserGroup = Awaited<
	ReturnType<typeof getProfileGroups>
>["data"][number];

export const profileOptions = () =>
	queryOptions({
		queryKey: ["profile"],
		queryFn: () => getProfile(),
	});

export const useProfile = () => {
	return useQuery(profileOptions());
};

export const profileGroupsOptions = () =>
	queryOptions({
		queryKey: ["profile", "groups"],
		queryFn: getProfileGroups,
	});

export const useProfileGroups = () => {
	return useQuery(profileGroupsOptions());
};

export const useUpdateProfile = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (body: UpdateProfileBody) => updateProfile(body),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["profile"] });
		},
	});
};
