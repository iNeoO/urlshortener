import { createRootRoute, Outlet } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import { Navbar } from "../components/ui/navbar";

const RootLayout = () => (
	<>
		<Navbar />
		<Outlet />
		<TanStackRouterDevtools />
	</>
);

export const Route = createRootRoute({ component: RootLayout });
