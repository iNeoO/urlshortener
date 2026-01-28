import { Link } from "@tanstack/react-router";

export function Navbar() {
	return (
		<div className="border-b border-slate-200 bg-white shadow-sm">
			<div className="mx-auto flex justify-between px-6 py-4">
				<Link
					to="/"
					className="text-lg font-semibold text-slate-900 hover:text-slate-700"
				>
					Urlshortener
				</Link>
			</div>
		</div>
	);
}
