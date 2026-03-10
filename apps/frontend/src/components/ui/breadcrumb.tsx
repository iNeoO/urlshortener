import { Link } from "@tanstack/react-router";

export type BreadcrumbItem = {
	label: string;
	to?: string;
};

type BreadcrumbProps = {
	items: BreadcrumbItem[];
};

export function Breadcrumb({ items }: BreadcrumbProps) {
	return (
		<nav aria-label="Breadcrumb">
			<ol className="flex flex-wrap items-center gap-2 text-sm text-(--color-muted)">
				{items.map((item, index) => {
					const isLast = index === items.length - 1;
					return (
						<li
							key={`${item.label}-${index}`}
							className="flex items-center gap-2"
						>
							{item.to && !isLast ? (
								<Link to={item.to} className="hover:text-(--color-text)">
									{item.label}
								</Link>
							) : (
								<span
									className={
										isLast ? "font-medium text-(--color-text)" : undefined
									}
								>
									{item.label}
								</span>
							)}
							{!isLast ? <span aria-hidden>/</span> : null}
						</li>
					);
				})}
			</ol>
		</nav>
	);
}
