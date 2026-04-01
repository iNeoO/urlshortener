import {
	autoUpdate,
	FloatingPortal,
	flip,
	offset,
	shift,
	useClick,
	useDismiss,
	useFloating,
	useInteractions,
} from "@floating-ui/react";
import { ChevronDownIcon, ChevronUpIcon } from "@heroicons/react/20/solid";
import type { Role } from "@urlshortener/common/types";
import { clsx } from "clsx";
import { useState } from "react";
import { RoleTag } from "./role.tag";

type RoleSelectMenuProps = {
	role: Role;
	options: Exclude<Role, "OWNER">[];
	onSelect: (role: Exclude<Role, "OWNER">) => void;
	disabled?: boolean;
};

export function RoleSelectMenu({
	role,
	options,
	onSelect,
	disabled = false,
}: RoleSelectMenuProps) {
	const [open, setOpen] = useState(false);

	const { refs, floatingStyles, context } = useFloating({
		open,
		onOpenChange: setOpen,
		placement: "bottom-end",
		whileElementsMounted: autoUpdate,
		middleware: [offset(8), flip(), shift({ padding: 8 })],
	});

	const click = useClick(context, { enabled: !disabled });
	const dismiss = useDismiss(context);
	const { getReferenceProps, getFloatingProps } = useInteractions([
		click,
		dismiss,
	]);

	return (
		<>
			<button
				ref={refs.setReference}
				type="button"
				disabled={disabled}
				className={clsx(
					"inline-flex rounded-md transition",
					disabled ? "cursor-not-allowed opacity-70" : "cursor-pointer",
				)}
				aria-expanded={open}
				aria-haspopup="menu"
				aria-label="Update role"
				{...getReferenceProps()}
			>
				<RoleTag
					role={role}
					trailingIcon={
						open ? (
							<ChevronUpIcon className="h-4 w-4" />
						) : (
							<ChevronDownIcon className="h-4 w-4" />
						)
					}
				/>
			</button>

			{open ? (
				<FloatingPortal>
					<div
						ref={refs.setFloating}
						style={floatingStyles}
						className="z-50 min-w-32 overflow-hidden rounded-xl border border-(--color-border) bg-(--color-ice) p-1 shadow-[0_16px_32px_rgba(0,0,0,0.35)]"
						role="menu"
						{...getFloatingProps()}
					>
						{options.map((nextRole) => (
							<button
								key={nextRole}
								type="button"
								role="menuitem"
								className="flex w-full items-center rounded-md px-2 py-1.5 text-left text-(--color-text) transition-colors hover:bg-(--color-border)/35"
								onClick={() => {
									onSelect(nextRole);
									setOpen(false);
								}}
							>
								<RoleTag role={nextRole} />
							</button>
						))}
					</div>
				</FloatingPortal>
			) : null}
		</>
	);
}
