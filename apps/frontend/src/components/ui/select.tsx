import {
	autoUpdate,
	FloatingFocusManager,
	FloatingPortal,
	flip,
	type MiddlewareState,
	offset,
	shift,
	size,
	useClick,
	useDismiss,
	useFloating,
	useInteractions,
	useListNavigation,
	useRole,
	useTypeahead,
} from "@floating-ui/react";
import { CheckIcon, ChevronUpDownIcon } from "@heroicons/react/20/solid";
import { clsx } from "clsx";
import type { ComponentPropsWithoutRef } from "react";
import { useMemo, useRef, useState } from "react";

export type SelectOption = {
	label: string;
	value: string;
	disabled?: boolean;
};

type SelectProps = Omit<
	ComponentPropsWithoutRef<"button">,
	"children" | "onChange" | "value" | "type"
> & {
	label: string;
	value?: string;
	options: SelectOption[];
	onChange: (value: string) => void;
	placeholder?: string;
	error?: string;
	wrapperClassName?: string;
	labelClassName?: string;
	errorClassName?: string;
};

export function Select({
	label,
	value,
	options,
	onChange,
	placeholder = "Select an option",
	error,
	wrapperClassName,
	labelClassName,
	errorClassName,
	className,
	disabled,
	id,
	...props
}: SelectProps) {
	const [open, setOpen] = useState(false);
	const [activeIndex, setActiveIndex] = useState<number | null>(null);
	const listRef = useRef<Array<HTMLButtonElement | null>>([]);
	const labelsRef = useRef<Array<string | null>>([]);

	const selectedIndex = useMemo(
		() => options.findIndex((option) => option.value === value),
		[options, value],
	);
	const selectedOption =
		selectedIndex >= 0 ? options[selectedIndex] : undefined;
	labelsRef.current = options.map((option) =>
		option.disabled ? null : option.label,
	);

	const { refs, floatingStyles, context } = useFloating({
		open,
		onOpenChange: setOpen,
		whileElementsMounted: autoUpdate,
		placement: "bottom-start",
		middleware: [
			offset(6),
			flip(),
			shift({ padding: 8 }),
			size({
				apply({ rects, elements }: MiddlewareState) {
					Object.assign(elements.floating.style, {
						width: `${rects.reference.width}px`,
					});
				},
			}),
		],
	});

	const click = useClick(context);
	const dismiss = useDismiss(context);
	const role = useRole(context, { role: "listbox" });
	const listNavigation = useListNavigation(context, {
		listRef,
		activeIndex,
		selectedIndex: selectedIndex >= 0 ? selectedIndex : null,
		onNavigate: setActiveIndex,
		loop: true,
	});
	const typeahead = useTypeahead(context, {
		listRef: labelsRef,
		activeIndex,
		selectedIndex: selectedIndex >= 0 ? selectedIndex : null,
		onMatch: setActiveIndex,
		enabled: open,
	});
	const { getReferenceProps, getFloatingProps, getItemProps } = useInteractions(
		[click, dismiss, role, listNavigation, typeahead],
	);

	const handleSelect = (nextValue: string) => {
		onChange(nextValue);
		setOpen(false);
	};

	return (
		<div className={clsx("space-y-1", wrapperClassName)}>
			<label
				htmlFor={id}
				className={clsx(
					"text-sm font-medium",
					error ? "text-red-400" : "text-(--color-text)",
					labelClassName,
				)}
			>
				{label}
			</label>
			<button
				id={id}
				ref={refs.setReference}
				type="button"
				disabled={disabled}
				className={clsx(
					"flex w-full items-center justify-between rounded-xl border bg-(--color-panel) px-3 py-2.5 text-sm text-(--color-text) outline-none transition",
					error
						? "border-rose-500 focus:border-rose-500 focus:ring-2 focus:ring-rose-900/40"
						: "border-(--color-border) focus:border-(--color-primary) focus:ring-2 focus:ring-(--color-primary)/30",
					disabled ? "cursor-not-allowed opacity-70" : "cursor-pointer",
					className,
				)}
				aria-invalid={Boolean(error)}
				aria-expanded={open}
				aria-haspopup="listbox"
				{...getReferenceProps(props)}
			>
				<span
					className={clsx(!selectedOption ? "text-(--color-muted)" : undefined)}
				>
					{selectedOption?.label ?? placeholder}
				</span>
				<ChevronUpDownIcon className="h-4 w-4 text-(--color-muted)" />
			</button>

			{open ? (
				<FloatingPortal>
					<FloatingFocusManager
						context={context}
						modal={false}
						initialFocus={-1}
					>
						<div
							ref={refs.setFloating}
							style={floatingStyles}
							className="z-50 overflow-hidden rounded-xl border border-(--color-border) bg-(--color-panel) shadow-[0_16px_32px_rgba(0,0,0,0.45)]"
							{...getFloatingProps()}
						>
							<div className="max-h-56 overflow-auto p-1">
								{options.map((option, index) => {
									const isSelected = option.value === value;
									const isActive = activeIndex === index;

									return (
										<button
											key={option.value}
											ref={(node) => {
												listRef.current[index] = node;
											}}
											type="button"
											role="option"
											aria-selected={isSelected}
											disabled={option.disabled}
											className={clsx(
												"flex w-full items-center justify-between rounded px-2 py-2 text-left text-sm",
												option.disabled
													? "cursor-not-allowed text-(--color-muted)/70"
													: "cursor-pointer text-(--color-text)",
												isActive && !option.disabled
													? "bg-(--color-surface)"
													: undefined,
											)}
											{...getItemProps({
												onClick() {
													if (option.disabled) return;
													handleSelect(option.value);
												},
											})}
										>
											<span>{option.label}</span>
											{isSelected ? (
												<CheckIcon className="h-4 w-4 text-(--color-primary)" />
											) : null}
										</button>
									);
								})}
							</div>
						</div>
					</FloatingFocusManager>
				</FloatingPortal>
			) : null}

			{error ? (
				<p className={clsx("text-xs text-rose-400", errorClassName)}>{error}</p>
			) : null}
		</div>
	);
}
