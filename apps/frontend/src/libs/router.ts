import { createRouter } from "@tanstack/react-router";
import { routeTree } from "../routeTree.gen";

export const router = createRouter({
	routeTree,
	context: {
		// biome-ignore lint/style/noNonNullAssertion: need to assert non-null for context properties
		auth: undefined!,
	},
});
