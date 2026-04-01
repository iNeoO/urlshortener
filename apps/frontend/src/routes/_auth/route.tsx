import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { AuthLayout } from "../../components/layout/auth.layout";

export const Route = createFileRoute("/_auth")({
	beforeLoad: async ({ context }) => {
		const { isAuthenticated } = context.auth;

		if (!isAuthenticated) {
			throw redirect({ to: "/login" });
		}
	},
	component: RouteComponent,
});

function RouteComponent() {
	return (
		<div>
			<AuthLayout>
				<Outlet />
			</AuthLayout>
		</div>
	);
}
