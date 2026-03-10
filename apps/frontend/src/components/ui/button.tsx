import { clsx } from "clsx";
import type { ComponentPropsWithoutRef } from "react";

type ButtonProps = ComponentPropsWithoutRef<"button"> & {
	variant?: "primary" | "secondary";
};

export function Button({
	className,
	variant = "primary",
	type = "button",
	...props
}: ButtonProps) {
	const baseClassName =
		"inline-flex items-center rounded-xl px-4 py-2 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-70";

	const variantClassName =
		variant === "primary"
			? "cursor-pointer bg-blue-600 text-white hover:bg-blue-500"
			: "cursor-pointer border border-(--color-border) bg-(--color-panel) text-(--color-text) hover:border-(--color-secondary)/55 hover:text-white";

	return (
		<button
			type={type}
			className={clsx(baseClassName, variantClassName, className)}
			{...props}
		/>
	);
}
