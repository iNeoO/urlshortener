import { clsx } from "clsx";
import type { ComponentPropsWithoutRef } from "react";
import { useId } from "react";

type TextAreaProps = ComponentPropsWithoutRef<"textarea"> & {
	label: string;
	error?: string;
	wrapperClassName?: string;
	labelClassName?: string;
	errorClassName?: string;
};

export function TextArea({
	className,
	error,
	id,
	label,
	wrapperClassName,
	labelClassName,
	errorClassName,
	rows = 4,
	...props
}: TextAreaProps) {
	const generatedId = useId();
	const textAreaId = id ?? generatedId;
	const errorId = `${textAreaId}-error`;

	return (
		<div className={clsx("space-y-1", wrapperClassName)}>
			<label
				htmlFor={textAreaId}
				className={clsx(
					"text-sm font-medium",
					error ? "text-red-400" : "text-(--color-text)",
					labelClassName,
				)}
			>
				{label}
			</label>
			<textarea
				id={textAreaId}
				rows={rows}
				aria-invalid={Boolean(error)}
				aria-describedby={error ? errorId : undefined}
				className={clsx(
					"w-full rounded-xl border bg-(--color-panel) px-3 py-2.5 text-sm text-(--color-text) outline-none transition placeholder:text-(--color-muted)",
					error
						? "border-rose-500 focus:border-rose-500 focus:ring-2 focus:ring-rose-900/40"
						: "border-(--color-border) focus:border-(--color-primary) focus:ring-2 focus:ring-(--color-primary)/30",
					className,
				)}
				{...props}
			/>
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
