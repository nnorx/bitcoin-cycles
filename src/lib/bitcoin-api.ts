import staticPriceData from "@/data/btc-price-history.json";
import { CACHE_KEY, CACHE_META_KEY, CACHE_TTL_MS } from "./bitcoin-constants";
import type { DailyPrice, RawPricePoint } from "./bitcoin-types";

interface CacheMeta {
	fetchedAt: number;
}

/** Parse the bundled static dataset into DailyPrice[] */
function getStaticData(): DailyPrice[] {
	return (staticPriceData as RawPricePoint[]).map(([ts, price]) => ({
		date: new Date(ts),
		price,
	}));
}

function readRecentCache(): DailyPrice[] | null {
	try {
		const metaRaw = localStorage.getItem(CACHE_META_KEY);
		if (!metaRaw) return null;

		const meta: CacheMeta = JSON.parse(metaRaw);
		if (Date.now() - meta.fetchedAt > CACHE_TTL_MS) return null;

		const dataRaw = localStorage.getItem(CACHE_KEY);
		if (!dataRaw) return null;

		const parsed: Array<{ date: string; price: number }> = JSON.parse(dataRaw);
		return parsed.map((d) => ({ date: new Date(d.date), price: d.price }));
	} catch {
		return null;
	}
}

function writeRecentCache(data: DailyPrice[]): void {
	try {
		const serializable = data.map((d) => ({
			date: d.date.toISOString(),
			price: d.price,
		}));
		localStorage.setItem(CACHE_KEY, JSON.stringify(serializable));
		localStorage.setItem(
			CACHE_META_KEY,
			JSON.stringify({ fetchedAt: Date.now() }),
		);
	} catch {
		// localStorage full or unavailable — silently skip caching
	}
}

/** Fetch recent data from CoinGecko (last 365 days) and merge with static data */
async function fetchRecentData(): Promise<DailyPrice[]> {
	const cached = readRecentCache();
	if (cached) return cached;

	const oneYearAgo = Math.floor(
		(Date.now() - 365 * 24 * 60 * 60 * 1000) / 1000,
	);
	const to = Math.floor(Date.now() / 1000);

	const apiKey = import.meta.env.VITE_COINGECKO_API_KEY as string | undefined;
	const isDev = import.meta.env.DEV;
	const baseUrl = isDev
		? "/api/coingecko/api/v3"
		: "https://api.coingecko.com/api/v3";
	const url = `${baseUrl}/coins/bitcoin/market_chart/range?vs_currency=usd&from=${oneYearAgo}&to=${to}`;

	const headers: HeadersInit = {};
	if (apiKey) {
		headers["x-cg-demo-api-key"] = apiKey;
	}

	const response = await fetch(url, { headers });
	if (!response.ok) {
		if (response.status === 429) {
			throw new Error(
				"Rate limited by CoinGecko. Please try again in a minute.",
			);
		}
		throw new Error(`CoinGecko API error: ${response.status}`);
	}

	const json: { prices: RawPricePoint[] } = await response.json();
	const recent = json.prices.map(([ts, price]) => ({
		date: new Date(ts),
		price,
	}));

	writeRecentCache(recent);
	return recent;
}

/**
 * Get full Bitcoin price history by merging bundled static data
 * with fresh API data for the most recent period.
 */
export async function fetchBitcoinPriceHistory(): Promise<DailyPrice[]> {
	const staticData = getStaticData();
	const lastStaticDate = staticData[staticData.length - 1]?.date ?? new Date();

	try {
		const recentData = await fetchRecentData();

		// Merge: use static data up to the overlap point, then append fresh data
		const cutoff = lastStaticDate.getTime() - 7 * 24 * 60 * 60 * 1000; // 7-day overlap
		const historicalPortion = staticData.filter(
			(d) => d.date.getTime() < cutoff,
		);
		const freshPortion = recentData.filter((d) => d.date.getTime() >= cutoff);

		return [...historicalPortion, ...freshPortion];
	} catch {
		// API failed — return static data only (still useful, just not up-to-the-minute)
		return staticData;
	}
}
