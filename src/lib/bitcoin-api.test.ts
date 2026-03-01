import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { CACHE_KEY, CACHE_META_KEY } from "./bitcoin-constants";

// Mock the static JSON import with a small dataset
vi.mock("@/data/btc-price-history.json", () => ({
	default: [
		[1262304000000, 0.05], // 2010-01-01
		[1293840000000, 0.3], // 2010-12-31
		[1325376000000, 5.27], // 2011-12-31
	],
}));

// Dynamic import after mock is set up
const { fetchBitcoinPriceHistory } = await import("./bitcoin-api");

const MOCK_API_PRICES = [
	[Date.now() - 2 * 86_400_000, 50000] as const,
	[Date.now() - 86_400_000, 51000] as const,
];

describe("fetchBitcoinPriceHistory", () => {
	beforeEach(() => {
		localStorage.clear();
		vi.restoreAllMocks();
	});

	afterEach(() => {
		localStorage.clear();
	});

	it("merges static data with fresh API data", async () => {
		vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
			new Response(JSON.stringify({ prices: MOCK_API_PRICES }), {
				status: 200,
			}),
		);

		const data = await fetchBitcoinPriceHistory();

		// Static historical portion (before cutoff) + fresh API portion
		expect(data.length).toBeGreaterThan(0);
		// First entries come from static data
		expect(data[0]?.price).toBe(0.05);
		// Last entries come from API
		expect(data[data.length - 1]?.price).toBe(51000);
	});

	it("falls back to static data when API fails", async () => {
		vi.spyOn(globalThis, "fetch").mockRejectedValueOnce(
			new Error("Network error"),
		);

		const data = await fetchBitcoinPriceHistory();

		// Should return static data without throwing
		expect(data).toHaveLength(3);
		expect(data[0]?.price).toBe(0.05);
		expect(data[2]?.price).toBe(5.27);
	});

	it("uses cached recent data instead of fetching", async () => {
		const cached = [
			{ date: new Date(Date.now() - 86_400_000).toISOString(), price: 49000 },
			{ date: new Date().toISOString(), price: 50000 },
		];
		localStorage.setItem(CACHE_KEY, JSON.stringify(cached));
		localStorage.setItem(
			CACHE_META_KEY,
			JSON.stringify({ fetchedAt: Date.now() }),
		);

		const fetchSpy = vi.spyOn(globalThis, "fetch");
		await fetchBitcoinPriceHistory();

		expect(fetchSpy).not.toHaveBeenCalled();
	});

	it("writes data to cache after successful fetch", async () => {
		vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
			new Response(JSON.stringify({ prices: MOCK_API_PRICES }), {
				status: 200,
			}),
		);

		await fetchBitcoinPriceHistory();

		expect(localStorage.getItem(CACHE_KEY)).not.toBeNull();
		expect(localStorage.getItem(CACHE_META_KEY)).not.toBeNull();
	});

	it("falls back to static data on rate limit instead of throwing", async () => {
		vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
			new Response("", { status: 429 }),
		);

		const data = await fetchBitcoinPriceHistory();

		// Graceful fallback — no error, returns static data
		expect(data).toHaveLength(3);
		expect(data[0]?.price).toBe(0.05);
	});

	it("fetches from API when cache is stale", async () => {
		const cached = [{ date: "2021-01-01T00:00:00.000Z", price: 29000 }];
		localStorage.setItem(CACHE_KEY, JSON.stringify(cached));
		localStorage.setItem(
			CACHE_META_KEY,
			JSON.stringify({ fetchedAt: Date.now() - 25 * 60 * 60 * 1000 }),
		);

		const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
			new Response(JSON.stringify({ prices: MOCK_API_PRICES }), {
				status: 200,
			}),
		);

		await fetchBitcoinPriceHistory();

		expect(fetchSpy).toHaveBeenCalledOnce();
	});
});
