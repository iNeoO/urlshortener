import {
	ArrowRightIcon,
	ChartBarSquareIcon,
	ShieldCheckIcon,
	UserGroupIcon,
} from "@heroicons/react/24/outline";
import { createFileRoute, Link } from "@tanstack/react-router";
import logoImage from "../assets/logo.png";
import membersImage from "../assets/members.png";
import dashboardImage from "../assets/url.dashboard.png";

const features = [
	{
		icon: ChartBarSquareIcon,
		title: "Simple click stats",
		description:
			"See aggregated clicks and quick breakdowns by browser, OS, device and referrer.",
	},
	{
		icon: ShieldCheckIcon,
		title: "Privacy-friendly",
		description:
			"Made to stay lightweight and respectful of privacy, with a simple RGPD-friendly approach.",
	},
	{
		icon: UserGroupIcon,
		title: "Team permissions",
		description: "Manage access with clear roles: admin, writer and reader.",
	},
];

const screenshots = [
	{
		title: "Dashboard",
		description: "See clicks and simple breakdowns at a glance.",
		image: dashboardImage,
		alt: "Dashboard view",
	},
	{
		title: "Members",
		description: "Invite people and manage roles in a shared workspace.",
		image: membersImage,
		alt: "Members view",
	},
];

export const Route = createFileRoute("/")({ component: RouteComponent });

function RouteComponent() {
	return (
		<div className="landing-shell">
			<header className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-6">
				<div className="flex items-center gap-4">
					<img
						src={logoImage}
						alt="UrlShortener logo"
						className="landing-logo-image"
					/>
					<div>
						<p className="landing-wordmark">UrlShortener</p>
						<p className="mt-1 text-sm text-(--color-muted)">
							Open source URL shortener with click statistics
						</p>
					</div>
				</div>

				<nav className="flex items-center gap-3">
					<Link to="/login" className="landing-button landing-button-secondary">
						Log in
					</Link>
					<Link to="/sign-up" className="landing-button landing-button-primary">
						Sign up
					</Link>
				</nav>
			</header>

			<main className="mx-auto flex w-full max-w-6xl flex-col gap-16 px-6 pb-16 pt-8">
				<section className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(420px,1.1fr)] lg:items-center">
					<div className="max-w-2xl">
						<p className="landing-kicker">Open source • Free • Simple</p>
						<h1 className="mt-4 text-4xl font-semibold tracking-[-0.04em] text-white sm:text-5xl">
							Shorten links and understand how they are used.
						</h1>
						<p className="mt-5 text-base leading-7 text-(--color-muted)">
							UrlShortener helps you create short links and read essential click
							stats. You can follow aggregated clicks, browse simple analytics,
							and collaborate with role-based access.
						</p>

						<div className="mt-8 flex flex-col gap-3 sm:flex-row">
							<Link
								to="/sign-up"
								className="landing-button landing-button-primary landing-button-large"
							>
								Try it
								<ArrowRightIcon className="size-4" />
							</Link>
							<Link
								to="/login"
								className="landing-button landing-button-secondary landing-button-large"
							>
								Open the app
							</Link>
						</div>
					</div>

					<img
						src={dashboardImage}
						alt="Application dashboard preview"
						className="landing-app-image landing-app-image-hero"
					/>
				</section>

				<section className="grid gap-4 md:grid-cols-3">
					{features.map((feature) => {
						const Icon = feature.icon;

						return (
							<article key={feature.title} className="landing-panel">
								<div className="landing-feature-icon">
									<Icon className="size-5" />
								</div>
								<h2 className="mt-4 text-xl font-semibold text-white">
									{feature.title}
								</h2>
								<p className="mt-3 text-sm leading-6 text-(--color-muted)">
									{feature.description}
								</p>
							</article>
						);
					})}
				</section>

				<section>
					<div className="grid gap-8 md:grid-cols-2">
						{screenshots.map((screenshot) => (
							<article key={screenshot.title}>
								<img
									src={screenshot.image}
									alt={screenshot.alt}
									className="landing-app-image"
								/>
								<div className="mt-4">
									<h3 className="text-xl font-semibold text-white">
										{screenshot.title}
									</h3>
									<p className="mt-3 text-sm leading-6 text-(--color-muted)">
										{screenshot.description}
									</p>
								</div>
							</article>
						))}
					</div>
				</section>

				<section className="landing-panel flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
					<div className="max-w-2xl">
						<p className="landing-section-label">Get started</p>
						<h2 className="mt-3 text-3xl font-semibold tracking-[-0.04em] text-white">
							A free and open source way to shorten links and keep useful stats.
						</h2>
					</div>

					<Link
						to="/sign-up"
						className="landing-button landing-button-primary landing-button-large"
					>
						Create an account
						<ArrowRightIcon className="size-4" />
					</Link>
				</section>
			</main>
		</div>
	);
}
