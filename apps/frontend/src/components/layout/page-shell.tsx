import type { ReactNode } from "react";
import { Breadcrumb, type BreadcrumbItem } from "../ui/breadcrumb";

type PageShellProps = {
	title: string;
	subtitle?: string;
	breadcrumbs?: BreadcrumbItem[];
	actions?: ReactNode;
	children: ReactNode;
};

export function PageShell({
	title,
	subtitle,
	breadcrumbs,
	actions,
	children,
}: PageShellProps) {
	return (
		<div className="flex flex-col min-h-full">
			<div className="px-4 pt-4">
				<header className="rounded-2xl border border-(--color-border) bg-(--color-panel) px-6 py-4 shadow-[0_12px_26px_rgba(0,0,0,0.42)] ring-1 ring-white/[0.04]">
					<div className="flex items-center justify-between gap-4">
						<div className="min-w-0">
							{breadcrumbs && breadcrumbs.length > 0 ? (
								<div className="mb-1">
									<Breadcrumb items={breadcrumbs} />
								</div>
							) : null}
							<h1 className="text-xl font-semibold tracking-tight text-(--color-text) truncate">
								{title}
							</h1>
							{subtitle ? (
								<p className="mt-0.5 text-sm text-(--color-muted)">{subtitle}</p>
							) : null}
						</div>
						{actions ? (
							<div className="flex shrink-0 items-center gap-3">{actions}</div>
						) : null}
					</div>
				</header>
			</div>
			<div className="flex-1 p-6">{children}</div>
		</div>
	);
}
