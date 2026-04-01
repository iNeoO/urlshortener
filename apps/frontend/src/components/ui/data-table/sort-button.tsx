import {
	ArrowDownIcon,
	ArrowsUpDownIcon,
	ArrowUpIcon,
} from "@heroicons/react/24/solid";
import { clsx } from "clsx";
import type { ComponentPropsWithoutRef, ReactNode } from "react";

type SortDirection = false | "asc" | "desc";

type SortButtonProps = {
	label: ReactNode;
	direction: SortDirection;
} & Omit<ComponentPropsWithoutRef<"button">, "children">;

export function SortButton({
	label,
	direction,
	className,
	type = "button",
	...props
}: SortButtonProps) {
	const Icon =
		direction === "asc"
			? ArrowUpIcon
			: direction === "desc"
				? ArrowDownIcon
				: ArrowsUpDownIcon;

	return (
		<button
			type={type}
			className={clsx(
				"inline-flex items-center gap-2 font-semibold transition-colors",
				"cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]/30",
				direction
					? "text-[var(--color-primary)]"
					: "text-(--color-muted) hover:text-(--color-text)",
				className,
			)}
			{...props}
		>
			<span>{label}</span>
			<span
				className={clsx(
					"inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-md border bg-(--color-panel)",
					direction
						? "border-[var(--color-primary)] text-[var(--color-primary)]"
						: "border-(--color-border) text-(--color-muted)",
				)}
			>
				<Icon className="h-4 w-4" aria-hidden />
			</span>
		</button>
	);
}
