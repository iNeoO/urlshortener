import { z } from "zod";

export const createListSearchParamsSchema = <TSort extends string>(
	allowedSorts: readonly TSort[],
) =>
	z.object({
		limit: z.string().optional(),
		offset: z.string().optional(),
		sort: z.enum(allowedSorts).optional(),
		order: z.enum(["asc", "desc"]).optional(),
		search: z.string().optional(),
	});
