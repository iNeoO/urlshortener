import { ROLES } from "@urlshortener/common/constants";
import type { Role } from "@urlshortener/common/types";
import { clsx } from "clsx";
import type { ComponentPropsWithoutRef, ReactNode } from "react";
import { Tag } from "../ui/tag";

type RoleTagProps = Omit<ComponentPropsWithoutRef<typeof Tag>, "children"> & {
	role: Role;
	trailingIcon?: ReactNode;
};

export function RoleTag({
	role,
	trailingIcon,
	className,
	...props
}: RoleTagProps) {
	const variant =
		role === ROLES.OWNER
			? "violet"
			: role === ROLES.ADMIN
				? "blue"
				: role === ROLES.MEMBER
					? "green"
					: "amber";

	return (
		<Tag
			variant={variant}
			className={clsx(trailingIcon ? "gap-1" : undefined, className)}
			{...props}
		>
			<span>{role}</span>
			{trailingIcon ? <span aria-hidden>{trailingIcon}</span> : null}
		</Tag>
	);
}
