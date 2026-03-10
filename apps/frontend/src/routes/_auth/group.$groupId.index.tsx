import { createFileRoute, redirect } from "@tanstack/react-router";
import { z } from "zod";

const groupIdParamsSchema = z.object({
	groupId: z.uuidv7(),
});

export const Route = createFileRoute("/_auth/group/$groupId/")({
	params: {
		parse: (params) => groupIdParamsSchema.parse(params),
	},
	beforeLoad: ({ params }) => {
		throw redirect({
			to: "/group/$groupId/urls",
			params: { groupId: params.groupId },
		});
	},
	component: () => null,
});
