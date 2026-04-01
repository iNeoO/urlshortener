import { clsx } from "clsx";
import type { ComponentPropsWithoutRef } from "react";
import { useId } from "react";

type InputProps = ComponentPropsWithoutRef<"input"> & {
	label: string;
	error?: string;
	wrapperClassName?: string;
	labelClassName?: string;
	errorClassName?: string;
};

export function Input({
	className,
	error,
	id,
	label,
	wrapperClassName,
	labelClassName,
	errorClassName,
	...props
}: InputProps) {
	const generatedId = useId();
	const inputId = id ?? generatedId;
	const errorId = `${inputId}-error`;

	return (
		<div className={clsx("space-y-1", wrapperClassName)}>
			<label
				htmlFor={inputId}
				className={clsx(
					"text-sm font-medium",
					error ? "text-red-400" : "text-(--color-text)",
					labelClassName,
				)}
			>
				{label}
			</label>
			<div className="relative">
				<input
					id={inputId}
					aria-invalid={Boolean(error)}
					aria-describedby={error ? errorId : undefined}
					className={clsx(
						"w-full rounded-xl border bg-(--color-panel) px-3 py-2.5 text-sm text-(--color-text) outline-none transition placeholder:text-(--color-muted)",
						error
							? "border-rose-500 pr-9 focus:border-rose-500 focus:ring-2 focus:ring-rose-900/40"
							: "border-(--color-border) focus:border-(--color-primary) focus:ring-2 focus:ring-(--color-primary)/30",
						className,
					)}
					{...props}
				/>
				{error ? (
					<span
						aria-hidden
						className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-rose-400"
					>
						!
					</span>
				) : null}
			</div>
			{error ? (
				<p
					id={errorId}
					className={clsx("text-xs text-rose-400", errorClassName)}
				>
					{error}
				</p>
			) : null}
		</div>
	);
}
