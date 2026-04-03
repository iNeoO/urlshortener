import { clsx } from "clsx";
import type { ComponentPropsWithoutRef } from "react";

type ErrorMessageProps = {
	message: string;
	variant?: "warning" | "success" | "info" | "error";
} & Omit<ComponentPropsWithoutRef<"div">, "children">;

const variantClassNames = {
	error:
		"border-red-500/45 bg-red-950/65 text-red-100 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]",
	warning:
		"border-amber-400/45 bg-amber-950/60 text-amber-100 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]",
	success:
		"border-emerald-500/45 bg-emerald-950/65 text-emerald-100 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]",
	info: "border-sky-500/45 bg-sky-950/65 text-sky-100 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]",
} as const;

export function ErrorMessage({
	message,
	variant = "error",
	className,
	...props
}: ErrorMessageProps) {
	return (
		<div
			{...props}
			className={clsx(
				"rounded-xl border p-4 text-sm font-medium backdrop-blur-sm",
				variantClassNames[variant],
				className,
			)}
		>
			{message}
		</div>
	);
}
