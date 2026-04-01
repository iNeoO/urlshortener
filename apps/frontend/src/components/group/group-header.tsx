import type { ReactNode } from "react";
import { AuthHeaderPortal } from "../layout/auth-header.portal";
import { Breadcrumb, type BreadcrumbItem } from "../ui/breadcrumb";

type GroupHeaderProps = {
	title: string;
	breadcrumbItems?: BreadcrumbItem[];
	actions?: ReactNode;
};

export function GroupHeader({
	title,
	breadcrumbItems,
	actions,
}: GroupHeaderProps) {
	return (
		<AuthHeaderPortal>
			<div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
				<div className="space-y-2">
					<h1 className="text-2xl font-semibold text-(--color-text)">
						{title}
					</h1>
					{breadcrumbItems ? <Breadcrumb items={breadcrumbItems} /> : null}
				</div>
				{actions ? (
					<div className="flex items-center gap-2">{actions}</div>
				) : null}
			</div>
		</AuthHeaderPortal>
	);
}
