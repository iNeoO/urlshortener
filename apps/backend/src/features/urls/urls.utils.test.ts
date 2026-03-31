import { beforeEach, describe, expect, it, vi } from "vitest";

const FROM = 1767218400000;

describe("urls.utils", () => {
	beforeEach(() => {
		vi.restoreAllMocks();
		vi.resetModules();
	});

	describe("toBase62", () => {
		it("should convert numbers to base62", async () => {
			const { toBase62 } = await import("./urls.utils.js");

			expect(toBase62(0)).toBe("0");
			expect(toBase62(61)).toBe("Z");
			expect(toBase62(62)).toBe("10");
			expect(toBase62(3844)).toBe("100");
		});
	});

	describe("idGenerator", () => {
		it("should increment the counter when ids are generated in the same millisecond", async () => {
			const nowSpy = vi.spyOn(Date, "now").mockReturnValue(FROM);
			const { idGenerator } = await import("./urls.utils.js");

			expect(idGenerator.generateId()).toBe("001");
			expect(idGenerator.generateId()).toBe("002");

			nowSpy.mockRestore();
		});

		it("should reset the counter when the timestamp changes", async () => {
			vi.spyOn(Date, "now")
				.mockReturnValueOnce(FROM)
				.mockReturnValueOnce(FROM)
				.mockReturnValueOnce(FROM + 1);
			const { idGenerator } = await import("./urls.utils.js");

			expect(idGenerator.generateId()).toBe("001");
			expect(idGenerator.generateId()).toBe("100");
		});
	});
});
