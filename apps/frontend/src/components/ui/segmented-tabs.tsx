import { clsx } from "clsx";

export type SegmentedTabOption<T extends string> = {
	label: string;
	value: T;
};

type SegmentedTabsProps<T extends string> = {
	options: SegmentedTabOption<T>[];
	value: T;
	onChange: (value: T) => void;
	ariaLabel: string;
	className?: string;
};

export function SegmentedTabs<T extends string>({
	options,
	value,
	onChange,
	ariaLabel,
	className,
}: SegmentedTabsProps<T>) {
	return (
		<div
			role="tablist"
			aria-label={ariaLabel}
			className={clsx(
				"inline-flex max-w-full items-center gap-1 overflow-x-auto rounded-2xl border border-(--color-border) bg-(--color-panel)/80 p-1 shadow-[0_10px_24px_rgba(0,0,0,0.22)] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
				className,
			)}
		>
			{options.map((option) => {
				const isActive = option.value === value;
				return (
					<button
						key={option.value}
						type="button"
						role="tab"
						aria-selected={isActive}
						onClick={() => onChange(option.value)}
						className={clsx(
							"cursor-pointer whitespace-nowrap rounded-xl px-4 py-2 text-sm font-medium transition",
							"focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--color-primary)/60",
							isActive
								? "bg-(--color-surface) text-(--color-text) shadow-[0_4px_12px_rgba(0,0,0,0.18)]"
								: "text-(--color-muted) hover:bg-(--color-surface)/55 hover:text-(--color-text)",
						)}
					>
						{option.label}
					</button>
				);
			})}
		</div>
	);
}
