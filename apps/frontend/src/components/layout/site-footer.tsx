import { Link } from "@tanstack/react-router";

export function SiteFooter() {
	return (
		<footer className="border-t border-(--color-border) bg-(--color-surface-deep)/70">
			<div className="mx-auto flex w-full max-w-6xl flex-col gap-3 px-6 py-5 text-sm text-(--color-muted) md:flex-row md:items-center md:justify-between">
				<div className="flex flex-wrap items-center gap-x-4 gap-y-2">
					<Link
						to="/cgu"
						className="transition-colors hover:text-(--color-text)"
					>
						CGU
					</Link>
					<span className="hidden text-(--color-border) md:inline">•</span>
					<a
						href="http://github.com/ineoo"
						target="_blank"
						rel="noreferrer"
						className="transition-colors hover:text-(--color-text)"
					>
						Made with love by ineoo
					</a>
					<span className="hidden text-(--color-border) md:inline">•</span>
					<a
						href="https://github.com/iNeoO/urlshortener/issues"
						target="_blank"
						rel="noreferrer"
						className="transition-colors hover:text-(--color-text)"
					>
						If you have any issue
					</a>
				</div>

				<a
					href="https://github.com/iNeoO/urlshortener/"
					target="_blank"
					rel="noreferrer"
					className="transition-colors hover:text-(--color-text)"
				>
					Source code of the application
				</a>
			</div>
		</footer>
	);
}
