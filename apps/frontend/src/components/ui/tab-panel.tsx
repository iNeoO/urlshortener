import { clsx } from "clsx";
import { useLayoutEffect, useRef, useState } from "react";

export type TabItem<T extends string> = {
	id: T;
	label: string;
};

type TabPanelProps<T extends string> = {
	id: string;
	tabs: TabItem<T>[];
	activeTab: T;
	onChange: (tab: T) => void;
	className?: string;
};

export function TabPanel<T extends string>({
	id,
	tabs,
	activeTab,
	onChange,
	className,
}: TabPanelProps<T>) {
	const tabRefs = useRef<Record<string, HTMLButtonElement | null>>({});
	const tabListRef = useRef<HTMLDivElement | null>(null);
	const [indicator, setIndicator] = useState({ left: 0, width: 0 });

	useLayoutEffect(() => {
		const updateIndicator = () => {
			const activeButton = tabRefs.current[activeTab];
			if (!activeButton) return;
			setIndicator({
				left: activeButton.offsetLeft,
				width: activeButton.offsetWidth,
			});
		};

		updateIndicator();

		if (typeof ResizeObserver === "undefined") return;

		const observer = new ResizeObserver(updateIndicator);
		if (tabListRef.current) observer.observe(tabListRef.current);

		return () => observer.disconnect();
	}, [activeTab]);

	return (
		<div
			className={clsx(
				"relative w-full border-b border-(--color-border)",
				className,
			)}
		>
			<div className="overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
				<div
					ref={tabListRef}
					role="tablist"
					aria-label={`${id}-tabs`}
					className="relative inline-flex min-w-max"
				>
					<div
						aria-hidden="true"
						className="pointer-events-none absolute bottom-0 h-0.5 bg-(--color-primary) transition-all duration-300 ease-out"
						style={{
							left: indicator.left,
							width: indicator.width,
						}}
					/>
					{tabs.map((tab) => {
						const isActive = tab.id === activeTab;
						return (
							<button
								ref={(element) => {
									tabRefs.current[tab.id] = element;
								}}
								key={tab.id}
								type="button"
								role="tab"
								aria-selected={isActive}
								aria-controls={`${id}-panel-${tab.id}`}
								id={`${id}-tab-${tab.id}`}
								onClick={() => onChange(tab.id)}
								className={clsx(
									"whitespace-nowrap px-6 py-3 text-center text-sm font-medium transition-colors cursor-pointer",
									"focus-visible:outline-none focus-visible:text-(--color-text)",
									isActive
										? "text-(--color-text)"
										: "text-(--color-muted) hover:text-(--color-text)",
								)}
							>
								{tab.label}
							</button>
						);
					})}
				</div>
			</div>
		</div>
	);
}
