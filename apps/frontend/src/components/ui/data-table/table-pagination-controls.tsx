import { Pagination } from "./pagination";
import { ShowPerPage } from "./show-per-page";

type TablePaginationControlsProps = {
	total: number;
	limit: number;
	offset: number;
	onOffsetChange: (nextOffset: number) => void;
	onLimitChange: (nextLimit: number) => void;
};

export function TablePaginationControls({
	total,
	limit,
	offset,
	onOffsetChange,
	onLimitChange,
}: TablePaginationControlsProps) {
	return (
		<div className="grid grid-cols-1 gap-3 border-t border-(--color-border) px-4 py-3 sm:grid-cols-[1fr_auto_1fr] sm:items-center">
			<div className="hidden sm:block" />
			<div className="flex justify-center">
				<Pagination
					total={total}
					limit={limit}
					offset={offset}
					onOffsetChange={onOffsetChange}
				/>
			</div>
			<div className="flex justify-end">
				<ShowPerPage limit={limit} onLimitChange={onLimitChange} />
			</div>
		</div>
	);
}
