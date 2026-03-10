import { clsx } from "clsx";
import type { ComponentPropsWithoutRef } from "react";

type ShowPerPageProps = Omit<ComponentPropsWithoutRef<"div">, "onChange"> & {
	limit: number;
	options?: number[];
	onLimitChange: (nextLimit: number) => void;
};

export function ShowPerPage({
	limit,
	options = [5, 10, 20, 50],
	onLimitChange,
	className,
	...props
}: ShowPerPageProps) {
	return (
		<div
			className={clsx(
				"inline-flex items-center gap-2 text-sm text-(--color-text)",
				className,
			)}
			{...props}
		>
			<span className="font-medium">Show per page:</span>
			<select
				value={String(limit)}
				onChange={(event) => onLimitChange(Number(event.target.value))}
				className="rounded-md border border-(--color-border) bg-(--color-panel) px-2 py-1 text-sm outline-none transition focus:border-(--color-primary) focus:ring-2 focus:ring-(--color-primary)/20"
			>
				{options.map((value) => (
					<option key={value} value={String(value)}>
						{value}
					</option>
				))}
			</select>
		</div>
	);
}
