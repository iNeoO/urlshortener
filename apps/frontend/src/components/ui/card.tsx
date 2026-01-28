import type { ComponentPropsWithoutRef } from "react";

type CardProps = ComponentPropsWithoutRef<"div">;

export function Card({ className, ...props }: CardProps) {
	const baseClassName =
		"block w-full rounded-lg border border-slate-200 bg-white p-6 shadow-sm";
	return (
		<div
			{...props}
			className={[baseClassName, className].filter(Boolean).join(" ")}
		/>
	);
}
