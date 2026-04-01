type SortOrder = "asc" | "desc";

type ListSearchQueryBase = {
	limit?: number;
	offset?: number;
	sort?: string;
	order?: SortOrder;
	search?: string;
};

type NormalizeListSearchParamsOptions<TQuery extends ListSearchQueryBase> = {
	allowedSorts: readonly NonNullable<TQuery["sort"]>[];
	minLimit?: number;
	maxLimit?: number;
};

export const normalizeListSearchParams = <TQuery extends ListSearchQueryBase>(
	search: Record<string, unknown>,
	options: NormalizeListSearchParamsOptions<TQuery>,
): Partial<TQuery> => {
	const normalized: Partial<TQuery> = {};
	const minLimit = options.minLimit ?? 1;
	const maxLimit = options.maxLimit ?? 100;
	const limit = Number(search.limit);
	const offset = Number(search.offset);
	const sort =
		typeof search.sort === "string" &&
		(options.allowedSorts as readonly string[]).includes(search.sort)
			? (search.sort as NonNullable<TQuery["sort"]>)
			: undefined;
	const order =
		search.order === "asc" || search.order === "desc"
			? (search.order as NonNullable<TQuery["order"]>)
			: undefined;
	const searchTerm =
		typeof search.search === "string" ? search.search.trim() : "";

	if (Number.isFinite(limit) && limit >= minLimit && limit <= maxLimit) {
		normalized.limit = limit as TQuery["limit"];
	}
	if (Number.isFinite(offset) && offset >= 0) {
		normalized.offset = offset as TQuery["offset"];
	}
	if (sort) {
		normalized.sort = sort;
	}
	if (order) {
		normalized.order = order;
	}
	if (searchTerm) {
		normalized.search = searchTerm as TQuery["search"];
	}

	return normalized;
};
