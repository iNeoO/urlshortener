import { clsx } from "clsx";
import type { ComponentPropsWithoutRef } from "react";

type ErrorMessageProps = {
	message: string;
	variant?: "warning" | "success" | "info" | "error";
} & Omit<ComponentPropsWithoutRef<"div">, "children">;

const variantClassNames = {
	error: "border-red-200 bg-red-50 text-red-700",
	warning: "border-amber-200 bg-amber-50 text-amber-800",
	success: "border-emerald-200 bg-emerald-50 text-emerald-700",
	info: "border-sky-200 bg-sky-50 text-sky-700",
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
				"rounded-lg border p-4 text-sm",
				variantClassNames[variant],
				className,
			)}
		>
			{message}
		</div>
	);
}
