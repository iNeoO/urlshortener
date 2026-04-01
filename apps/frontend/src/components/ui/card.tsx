import { clsx } from "clsx";
import type { ComponentPropsWithoutRef } from "react";

type CardProps = ComponentPropsWithoutRef<"div"> & {
	withPadding?: boolean;
};

export function Card({ className, withPadding = true, ...props }: CardProps) {
	const baseClassName =
		"block w-full rounded-2xl border border-(--color-border) bg-(--color-panel) text-(--color-text) shadow-[0_16px_32px_rgba(0,0,0,0.42)]";
	return (
		<div
			{...props}
			className={clsx(baseClassName, withPadding && "p-6", className)}
		/>
	);
}
