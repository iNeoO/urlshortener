import { XMarkIcon } from "@heroicons/react/24/solid";
import { type ReactNode, useEffect, useId, useRef } from "react";
import { createPortal } from "react-dom";

type ModalProps = {
	open: boolean;
	title: string;
	onClose: () => void;
	children: ReactNode;
	footer?: ReactNode;
};

const BACKDROP_CLASS_NAME = "absolute inset-0 bg-[#06080c]/55";
const WRAPPER_CLASS_NAME =
	"fixed inset-0 z-50 flex items-center justify-center p-4";
const PANEL_CLASS_NAME =
	"relative z-10 w-full max-w-md rounded-2xl border border-(--color-border) bg-linear-to-b from-(--color-panel) to-(--color-ice) text-(--color-text) shadow-[0_24px_50px_rgba(0,0,0,0.5)]";
const HEADER_CLASS_NAME =
	"flex items-center justify-between border-b border-(--color-border) px-4 py-3";
const BODY_CLASS_NAME = "px-4 py-4";
const FOOTER_CLASS_NAME =
	"flex items-center justify-end gap-2 border-t border-(--color-border) px-4 py-3";

const FOCUSABLE_SELECTOR = [
	"a[href]",
	"button:not([disabled])",
	"textarea:not([disabled])",
	"input:not([disabled])",
	"select:not([disabled])",
	"[tabindex]:not([tabindex='-1'])",
].join(",");

export function Modal({ open, title, onClose, children, footer }: ModalProps) {
	const titleId = useId();
	const panelRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		if (!open) return;
		const previousActiveElement = document.activeElement as HTMLElement | null;
		const panelElement = panelRef.current;
		if (!panelElement) return;

		const focusableElements =
			panelElement.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR);
		(focusableElements[0] ?? panelElement).focus();

		const onKeyDown = (event: KeyboardEvent) => {
			if (event.key === "Escape") {
				onClose();
				return;
			}
			if (event.key !== "Tab") return;

			const elements =
				panelElement.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR);
			if (elements.length === 0) {
				event.preventDefault();
				panelElement.focus();
				return;
			}

			const first = elements[0];
			const last = elements[elements.length - 1];
			const active = document.activeElement as HTMLElement | null;

			if (event.shiftKey && active === first) {
				event.preventDefault();
				last.focus();
				return;
			}
			if (!event.shiftKey && active === last) {
				event.preventDefault();
				first.focus();
			}
		};

		window.addEventListener("keydown", onKeyDown);
		return () => {
			window.removeEventListener("keydown", onKeyDown);
			previousActiveElement?.focus();
		};
	}, [open, onClose]);

	if (!open) return null;

	return createPortal(
		<div className={WRAPPER_CLASS_NAME} role="presentation">
			<button
				type="button"
				className={BACKDROP_CLASS_NAME}
				onClick={onClose}
				aria-label="Close modal"
			/>
			<div
				ref={panelRef}
				className={PANEL_CLASS_NAME}
				role="dialog"
				aria-modal="true"
				aria-labelledby={titleId}
				tabIndex={-1}
			>
				<div className={HEADER_CLASS_NAME}>
					<h2
						id={titleId}
						className="text-lg font-semibold text-(--color-text)"
					>
						{title}
					</h2>
					<button
						type="button"
						onClick={onClose}
						className="rounded-md p-1 text-(--color-muted) transition hover:bg-(--color-border)/40 hover:text-(--color-text)"
						aria-label="Close"
					>
						<XMarkIcon className="h-5 w-5" />
					</button>
				</div>
				<div className={BODY_CLASS_NAME}>{children}</div>
				{footer ? <div className={FOOTER_CLASS_NAME}>{footer}</div> : null}
			</div>
		</div>,
		document.body,
	);
}
