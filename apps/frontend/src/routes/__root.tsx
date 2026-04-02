import { createRootRouteWithContext, Outlet } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import { SiteFooter } from "../components/layout/site-footer";
import type { AuthState } from "../contexts/auth.context";

type RouterContext = {
	auth: AuthState;
};

export const Route = createRootRouteWithContext<RouterContext>()({
	component: () => (
		<div className="flex min-h-screen flex-col">
			<div className="flex-1">
				<Outlet />
			</div>
			<SiteFooter />
			<TanStackRouterDevtools />
		</div>
	),
});
