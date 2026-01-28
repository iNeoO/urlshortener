import { testClient } from "hono/testing";
import { pinoLogger } from "hono-pino";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { errorHandler } from "../../helpers/errors.js";
import { appWithLogs } from "../../helpers/factories/appWithLogs.js";
import { shortenurlController } from "./shortenurl.controller.js";
import {
	createShortenUrl,
	getShortenUrl,
	incrementShortenUrlClick,
} from "./shortenurl.service.js";
import { idGenerator, toBase62 } from "./shortenurl.utils.js";

vi.mock("./shortenurl.service.js", () => ({
	createShortenUrl: vi.fn(),
	getShortenUrl: vi.fn(),
	incrementShortenUrlClick: vi.fn(),
}));

vi.mock("./shortenurl.utils.js", () => ({
	idGenerator: { generateId: vi.fn() },
	toBase62: vi.fn(),
}));

const buildApp = () => {
	return appWithLogs
		.createApp()
		.use(pinoLogger())
		.route("/", shortenurlController)
		.onError(errorHandler);
};

describe("Shorten URL endpoints: /u", () => {
	const client = testClient(buildApp());

	beforeEach(() => {
		vi.clearAllMocks();
	});

	describe("POST /", () => {
		it("should create a short URL", async () => {
			const createdAt = new Date(0);
			vi.mocked(idGenerator.generateId).mockReturnValueOnce("123");
			vi.mocked(toBase62).mockReturnValueOnce("abc");
			vi.mocked(createShortenUrl).mockResolvedValueOnce({
				id: "123",
				name: "Test URL",
				description: "Example description",
				original: "https://example.com",
				short: "abc",
				createdAt,
			});

			const res = await client.index.$post({
				json: {
					name: "Test URL",
					description: "Example description",
					original: "https://example.com",
				},
			});

			expect(res.status).toBe(201);
			const json = await res.json();
			expect(json).toEqual({
				data: {
					id: "123",
					name: "Test URL",
					description: "Example description",
					original: "https://example.com",
					short: "abc",
					createdAt: createdAt.toISOString(),
				},
			});
		});

		it("should return 400 for invalid body", async () => {
			const res = await client.index.$post({
				json: {
					name: "",
					description: "",
					original: "not-a-url",
				},
			});

			expect(res.status).toBe(400);
			expect(createShortenUrl).not.toHaveBeenCalled();
		});
	});

	describe("GET /:id", () => {
		it("should redirect to the original URL", async () => {
			vi.mocked(getShortenUrl).mockResolvedValueOnce("https://example.com");
			vi.mocked(incrementShortenUrlClick).mockResolvedValueOnce(undefined);

			const res = await client[":id"].$get({ param: { id: "abc" } });

			expect(res.status).toBe(302);
			expect(res.headers.get("location")).toBe("https://example.com");
			expect(getShortenUrl).toHaveBeenCalledWith("abc");
			expect(incrementShortenUrlClick).toHaveBeenCalledWith("abc");
		});
	});
});
