import {
	ChartBarSquareIcon,
	ChevronRightIcon,
	Cog6ToothIcon,
	HomeIcon,
	LinkIcon,
	UsersIcon,
} from "@heroicons/react/24/solid";
import { Link, useRouterState } from "@tanstack/react-router";
import { useState } from "react";
import logo from "../../assets/logo.png";

const NAV_ITEMS = [
	{
		id: "home",
		label: "Home",
		icon: HomeIcon,
		to: "/home",
		isActive: ["/home"],
	},
	{
		id: "groups",
		label: "Groups",
		icon: UsersIcon,
		to: "/groups",
		isActive: ["/groups", "/create-group", "/group*"],
	},
	{
		id: "urls",
		label: "URLs",
		icon: LinkIcon,
		to: "/urls",
		isActive: ["/urls", "/urls*", "/create-url"],
	},
	{
		id: "invitations",
		label: "Invitations",
		icon: ChartBarSquareIcon,
		to: "/invitations",
		isActive: ["/invitations"],
	},
];

const isActivePath = (pathname: string, activePaths: string[]) => {
	return activePaths.some((path) => {
		if (path.endsWith("*")) {
			const basePath = path.slice(0, -1);
			return pathname.startsWith(basePath);
		}
		return pathname === path;
	});
};

export const Sidebar = () => {
	const [isOpen, setIsOpen] = useState(false);
	const pathname = useRouterState({
		select: (state) => state.location.pathname,
	});

	return (
		<aside
			className={[
				"relative h-[calc(100vh-2rem)] shrink-0 rounded-3xl bg-(--color-surface-deep) shadow-[0_22px_44px_rgba(0,0,0,0.45)] ring-1 ring-(--color-border)",
				"transition-[width] duration-300 ease-out",
				isOpen ? "w-64" : "w-20",
			].join(" ")}
		>
			<button
				type="button"
				aria-label={isOpen ? "Collapse sidebar" : "Expand sidebar"}
				onClick={() => setIsOpen((prev) => !prev)}
				className="absolute left-full top-7 -ml-2 rounded-full border border-(--color-border) bg-(--color-panel) p-1 text-(--color-primary) shadow-[0_8px_20px_rgba(0,0,0,0.45)] cursor-pointer"
			>
				<ChevronRightIcon
					className={[
						"h-4 w-4 transition-transform duration-300",
						isOpen ? "rotate-180" : "",
					].join(" ")}
				/>
			</button>
			<div className="flex h-full flex-col gap-5 overflow-hidden rounded-3xl bg-(--color-panel)">
				<div className="flex items-center gap-3 mt-4 m-4 mr-4">
					<div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-(--color-border) bg-(--color-surface-deep) shadow-[0_10px_20px_rgba(0,0,0,0.4)]">
						<div className="flex h-full w-full items-center justify-center rounded-2xl bg-linear-to-br from-(--color-panel) to-(--color-surface)">
							<img
								src={logo}
								alt="Logo"
								className="h-6 w-6 drop-shadow-[0_0_10px_rgba(29,115,255,0.7)]"
							/>
						</div>
					</div>
					{isOpen ? (
						<div className="text-sm font-semibold tracking-[0.2em] text-(--color-primary)">
							UrlShortener
						</div>
					) : null}
				</div>
				<nav className="flex flex-1 flex-col gap-2">
					{NAV_ITEMS.map((item) => {
						const Icon = item.icon;
						const isActive = isActivePath(pathname, item.isActive);
						return (
							<Link
								key={item.id}
								aria-label={item.label}
								to={item.to}
								className={[
									"relative flex h-11 w-full items-center cursor-pointer",
									"bg-text-(--color-muted)",
									"transition-all duration-200 hover:bg-(--color-surface) hover:text-(--color-text)",
									isActive ? "bg-[rgba(143,153,171,0.24)] text-white" : "",
									isOpen ? "gap-3 px-3" : "justify-center",
								].join(" ")}
							>
								<span
									className={[
										"absolute left-0 top-1/2 h-8 w-0.75 -translate-y-1/2 rounded-full bg-(--color-primary)",
										"transition-all duration-300 origin-center",
										isActive
											? "opacity-100 scale-y-130"
											: "opacity-0 scale-y-50",
									].join(" ")}
								/>
								<Icon className="h-5 w-5" />
								{isOpen ? (
									<span className="text-sm font-medium">{item.label}</span>
								) : null}
							</Link>
						);
					})}
				</nav>
				<Link
					aria-label="Settings"
					to="/settings"
					className={[
						"flex h-11 w-full items-center rounded-xl cursor-pointer text-(--color-muted) transition-all duration-200 hover:bg-(--color-surface) hover:text-(--color-text)",
						isOpen ? "gap-3 px-3" : "justify-center",
					].join(" ")}
				>
					<Cog6ToothIcon className="h-5 w-5" />
					{isOpen ? (
						<span className="text-sm font-medium">Settings</span>
					) : null}
				</Link>
			</div>
		</aside>
	);
};
