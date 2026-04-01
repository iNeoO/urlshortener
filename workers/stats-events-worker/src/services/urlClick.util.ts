import { UrlClickMessageSchema } from "@urlshortener/common/schema";

export const parseRawMessage = (payload: Buffer) => {
	const parsedJson = JSON.parse(payload.toString("utf-8"));
	return UrlClickMessageSchema.parse(parsedJson);
};
