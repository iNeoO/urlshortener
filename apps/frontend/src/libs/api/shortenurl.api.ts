import { client } from "../hc.js";

export type CreateShortenUrlBody = {
	name: string;
	description: string;
	original: string;
};

export async function createShortenUrl(body: CreateShortenUrlBody) {
	const res = await client.u.$post({
		json: body,
	});
	if (!res.ok) {
		throw new Error(
			`Failed to create short URL: ${res.status} ${res.statusText}`,
		);
	}
	const json = await res.json();
	return json;
}
