import { clsx } from "clsx";
import type { ComponentPropsWithoutRef, ReactNode } from "react";

type TagProps = ComponentPropsWithoutRef<"span"> & {
	children: ReactNode;
	variant?: "neutral" | "blue" | "green" | "violet" | "amber";
};

export function Tag({
	className,
	children,
	variant = "neutral",
	...props
}: TagProps) {
	const baseClassName =
		"inline-flex items-center rounded-lg px-2 py-1 text-xs font-semibold";

	const variantClassName =
		variant === "violet"
			? "bg-violet-500/20 text-violet-200"
			: variant === "blue"
				? "bg-sky-500/20 text-sky-200"
				: variant === "green"
					? "bg-emerald-500/20 text-emerald-200"
					: variant === "amber"
						? "bg-amber-500/20 text-amber-200"
						: "bg-(--color-surface) text-(--color-text)";

	return (
		<span
			className={clsx(baseClassName, variantClassName, className)}
			{...props}
		>
			{children}
		</span>
	);
}
