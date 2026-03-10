import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/")({ component: App });

function App() {
	return (
		<div className="mx-auto flex min-h-screen w-full max-w-3xl flex-col items-center justify-center gap-6 px-4">
			<h1 className="text-3xl font-bold text-slate-800">UrlShortener</h1>
			<div className="flex items-center gap-3">
				<Link
					to="/login"
					className="rounded-md bg-(--color-primary) px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90"
				>
					Go to Login
				</Link>
				<Link
					to="/sign-up"
					className="rounded-md border border-(--color-ice) bg-(--color-surface) px-4 py-2 text-sm font-medium text-(--color-primary) transition-opacity hover:opacity-90"
				>
					Go to Sign up
				</Link>
			</div>
		</div>
	);
}
