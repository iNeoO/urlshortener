import { createLink, type LinkComponent } from "@tanstack/react-router";
import { clsx } from "clsx";
import type { AnchorHTMLAttributes } from "react";
import { forwardRef } from "react";

interface BaseLinkProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
	variant?: "primary" | "secondary";
}

const BaseLink = forwardRef<HTMLAnchorElement, BaseLinkProps>(
	({ className, variant = "secondary", ...props }, ref) => {
		const baseClassName =
			"inline-flex items-center rounded-xl px-4 py-2 text-sm font-medium transition";
		const variantClassName =
			variant === "primary"
				? "bg-blue-600 text-white hover:bg-blue-500"
				: "border border-(--color-border) bg-(--color-panel) text-(--color-text) hover:border-(--color-secondary)/55 hover:text-white";

		return (
			<a
				ref={ref}
				className={clsx(baseClassName, variantClassName, className)}
				{...props}
			/>
		);
	},
);

const CreatedLink = createLink(BaseLink);

export const Link: LinkComponent<typeof BaseLink> = (props) => {
	return <CreatedLink preload="intent" {...props} />;
};
