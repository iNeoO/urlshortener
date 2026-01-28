import type { z } from "zod";
import type {
	GetCampaignsQuerySchema,
	GetCampaignsResponseSchema,
	GetLastHourClicksResponseSchema,
} from "./campaigns.schema.js";

export type GetCampaignsResponseApi = z.infer<
	typeof GetCampaignsResponseSchema
>;
type Campaign = Omit<GetCampaignsResponseApi["data"][number], "createdAt"> & {
	createdAt: Date;
};
export type CampaignsResponseApi = { data: Campaign[]; total: number };

type GetLastHourClickResponse = z.infer<typeof GetLastHourClicksResponseSchema>;
type LastHourClick = Omit<
	GetLastHourClickResponse["data"][number],
	"window"
> & {
	window: Date;
};
export type LastHourClicksResponseApi = { data: LastHourClick[] };

export type GetCampaignsParams = z.infer<typeof GetCampaignsQuerySchema>;
