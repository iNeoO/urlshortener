import type { ColumnDef } from "@tanstack/react-table";
import type { GetUrlsQuery } from "@urlshortener/common/types";
import { REDIRECTOR_URL } from "../../configs/constant";
import type { UrlFromUrls } from "../../hooks/query/urls.hook";
import { ALLOWED_URL_SORTS } from "../../utils/dataTable/urlsSorts";
import { Table } from "../ui/data-table/table";
import { Link } from "../ui/link";

type UrlsTableProps = {
	data: UrlFromUrls[];
	total?: number;
	search: string;
	onSearchChange: (value: string) => void;
	limit: number;
	offset: number;
	onOffsetChange: (nextOffset: number) => void;
	onLimitChange: (nextLimit: number) => void;
	sort: GetUrlsQuery["sort"] | undefined;
	order: GetUrlsQuery["order"] | undefined;
	onSortChange: (next: {
		sort?: GetUrlsQuery["sort"];
		order?: GetUrlsQuery["order"];
	}) => void;
	isLoading?: boolean;
	showCreateButton?: boolean;
};

const dateFormatter = new Intl.DateTimeFormat("en-US", {
	dateStyle: "medium",
	timeStyle: "short",
});

const toExternalHref = (value: unknown): string | undefined => {
	const raw = String(value ?? "").trim();
	if (!raw) return undefined;

	try {
		return new URL(raw).toString();
	} catch {
		try {
			return new URL(`https://${raw}`).toString();
		} catch {
			return undefined;
		}
	}
};

const columns: ColumnDef<UrlFromUrls>[] = [
	{
		accessorKey: "name",
		header: "Name",
		cell: (value) => value.getValue(),
	},
	{
		accessorKey: "description",
		header: "Description",
		cell: (value) => value.getValue() || "-",
	},
	{
		accessorKey: "original",
		header: "Original URL",
		cell: (value) => {
			const val = String(value.getValue() ?? "").trim();
			const href = toExternalHref(val);
			return (
				<a
					className="text-(--color-text) underline decoration-(--color-muted) underline-offset-2 hover:text-white"
					href={href}
					rel={href ? "noreferrer" : undefined}
					target={href ? "_blank" : undefined}
				>
					{val}
				</a>
			);
		},
	},
	{
		accessorKey: "short",
		header: "Short URL",
		cell: (value) => {
			const val = String(value.getValue() ?? "");
			const href = `${REDIRECTOR_URL}/${val}`;
			const label = href || val;
			return (
				<a
					className="text-(--color-text) underline decoration-(--color-muted) underline-offset-2 hover:text-white"
					href={href || undefined}
					rel={href ? "noreferrer" : undefined}
					target={href ? "_blank" : undefined}
				>
					{label}
				</a>
			);
		},
	},
	{
		accessorKey: "totalClicks",
		header: "Clicks",
		enableSorting: false,
		cell: (value) => (
			<span className="tabular-nums">{String(value.getValue() ?? 0)}</span>
		),
	},
	{
		accessorKey: "createdAt",
		header: "Created",
		cell: (value) => {
			const val = String(value.getValue() ?? "");
			const date = val ? new Date(val) : null;
			return (
				<span className="whitespace-nowrap text-(--color-muted)">
					{date && !Number.isNaN(date.getTime())
						? dateFormatter.format(date)
						: val}
				</span>
			);
		},
	},
	{
		id: "actions",
		header: "Action",
		enableSorting: false,
		cell: ({ row }) => (
			<Link
				to="/urls/$id"
				params={{ id: row.original.id }}
				className="inline-flex items-center rounded-lg border border-(--color-border) bg-(--color-panel) px-3 py-1.5 text-sm font-medium text-(--color-text) transition hover:border-(--color-muted) hover:text-white"
			>
				Open
			</Link>
		),
	},
];

export function UrlsTable({
	data,
	total,
	search,
	onSearchChange,
	limit,
	offset,
	onOffsetChange,
	onLimitChange,
	sort,
	order,
	onSortChange,
	isLoading = false,
	showCreateButton = true,
}: UrlsTableProps) {
	return (
		<Table
			columns={columns}
			total={total ?? data.length}
			name="urls"
			search={search}
			onSearchChange={onSearchChange}
			limit={limit}
			offset={offset}
			onOffsetChange={onOffsetChange}
			onLimitChange={onLimitChange}
			data={data}
			sort={sort}
			order={order}
			allowedSorts={ALLOWED_URL_SORTS}
			onSortChange={onSortChange}
			headerActions={
				showCreateButton ? (
					<Link to="/create-url" variant="primary">
						Create URL
					</Link>
				) : undefined
			}
			isLoading={isLoading}
		/>
	);
}
