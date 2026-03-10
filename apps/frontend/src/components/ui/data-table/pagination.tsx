import { clsx } from "clsx";
import type { ComponentPropsWithoutRef } from "react";

type PaginationProps = Omit<ComponentPropsWithoutRef<"nav">, "onChange"> & {
	total: number;
	limit: number;
	offset: number;
	onOffsetChange: (nextOffset: number) => void;
};

const getVisiblePages = (currentPage: number, totalPages: number) => {
	if (totalPages <= 7) {
		return Array.from({ length: totalPages }, (_, index) => index + 1);
	}

	const pages: Array<number | "..."> = [1];
	const start = Math.max(2, currentPage - 1);
	const end = Math.min(totalPages - 1, currentPage + 1);

	if (start > 2) pages.push("...");
	for (let page = start; page <= end; page += 1) pages.push(page);
	if (end < totalPages - 1) pages.push("...");

	pages.push(totalPages);
	return pages;
};

export function Pagination({
	total,
	limit,
	offset,
	onOffsetChange,
	className,
	...props
}: PaginationProps) {
	const totalPages = Math.max(1, Math.ceil(total / Math.max(1, limit)));
	const currentPage = Math.min(
		totalPages,
		Math.floor(offset / Math.max(1, limit)) + 1,
	);
	const canGoPrevious = currentPage > 1;
	const canGoNext = currentPage < totalPages;
	const pages = getVisiblePages(currentPage, totalPages);

	return (
		<nav
			aria-label="Pagination"
			className={clsx("inline-flex items-center gap-1", className)}
			{...props}
		>
			<button
				type="button"
				disabled={!canGoPrevious}
				onClick={() => onOffsetChange(0)}
				className="rounded-md border border-(--color-border) px-2 py-1 text-xs text-(--color-text) enabled:cursor-pointer enabled:hover:border-(--color-muted) disabled:opacity-50"
			>
				{"<<"}
			</button>
			<button
				type="button"
				disabled={!canGoPrevious}
				onClick={() => onOffsetChange(Math.max(0, offset - limit))}
				className="rounded-md border border-(--color-border) px-2 py-1 text-xs text-(--color-text) enabled:cursor-pointer enabled:hover:border-(--color-muted) disabled:opacity-50"
			>
				{"<"}
			</button>
			{pages.map((page, index) =>
				page === "..." ? (
					<span
						key={`ellipsis-${String(index)}`}
						className="px-1 text-xs text-(--color-muted)"
					>
						...
					</span>
				) : (
					<button
						key={page}
						type="button"
						onClick={() => onOffsetChange((page - 1) * limit)}
						className={clsx(
							"rounded-md border px-2 py-1 text-xs",
							page === currentPage
								? "border-(--color-primary) bg-(--color-primary)/15 text-(--color-text)"
								: "border-(--color-border) text-(--color-text) enabled:cursor-pointer enabled:hover:border-(--color-muted)",
						)}
					>
						{page}
					</button>
				),
			)}
			<button
				type="button"
				disabled={!canGoNext}
				onClick={() => onOffsetChange(offset + limit)}
				className="rounded-md border border-(--color-border) px-2 py-1 text-xs text-(--color-text) enabled:cursor-pointer enabled:hover:border-(--color-muted) disabled:opacity-50"
			>
				{">"}
			</button>
			<button
				type="button"
				disabled={!canGoNext}
				onClick={() => onOffsetChange((totalPages - 1) * limit)}
				className="rounded-md border border-(--color-border) px-2 py-1 text-xs text-(--color-text) enabled:cursor-pointer enabled:hover:border-(--color-muted) disabled:opacity-50"
			>
				{">>"}
			</button>
		</nav>
	);
}
