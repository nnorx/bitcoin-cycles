import type { YearGroup } from "./bitcoin-types";

export const HALVING_DATES = [
	new Date("2012-11-28T00:00:00Z"),
	new Date("2016-07-09T00:00:00Z"),
	new Date("2020-05-11T00:00:00Z"),
	new Date("2024-04-19T00:00:00Z"),
] as const;

/** Earliest date with reliable exchange price data */
export const BTC_DATA_START = new Date("2011-01-01T00:00:00Z");

export const CACHE_KEY = "btc-price-history";
export const CACHE_META_KEY = "btc-price-history-meta";
export const CACHE_TTL_MS = 24 * 60 * 60 * 1000;

/**
 * OKLCH series colors — one per year 2010–2026.
 * Hues use golden-angle spacing (~137.5°) so consecutive years
 * are maximally distinct on the color wheel.
 */
export const SERIES_COLORS_LIGHT = [
	"oklch(0.50 0.20 0)",
	"oklch(0.48 0.18 138)",
	"oklch(0.52 0.20 275)",
	"oklch(0.50 0.18 53)",
	"oklch(0.48 0.15 190)",
	"oklch(0.52 0.20 328)",
	"oklch(0.48 0.18 105)",
	"oklch(0.50 0.20 243)",
	"oklch(0.52 0.20 20)",
	"oklch(0.48 0.15 158)",
	"oklch(0.52 0.20 295)",
	"oklch(0.50 0.18 73)",
	"oklch(0.48 0.18 210)",
	"oklch(0.52 0.20 348)",
	"oklch(0.48 0.18 125)",
	"oklch(0.50 0.20 263)",
	"oklch(0.52 0.18 40)",
] as const;

export const SERIES_COLORS_DARK = [
	"oklch(0.72 0.18 0)",
	"oklch(0.68 0.16 138)",
	"oklch(0.74 0.18 275)",
	"oklch(0.70 0.16 53)",
	"oklch(0.68 0.14 190)",
	"oklch(0.74 0.18 328)",
	"oklch(0.68 0.16 105)",
	"oklch(0.72 0.18 243)",
	"oklch(0.74 0.18 20)",
	"oklch(0.68 0.14 158)",
	"oklch(0.74 0.18 295)",
	"oklch(0.70 0.16 73)",
	"oklch(0.68 0.16 210)",
	"oklch(0.74 0.18 348)",
	"oklch(0.68 0.16 125)",
	"oklch(0.72 0.18 263)",
	"oklch(0.74 0.16 40)",
] as const;

export const YEAR_GROUPS: YearGroup[] = [
	{
		id: "election",
		label: "Election",
		years: ["2012", "2016", "2020", "2024"],
	},
	{
		id: "post-election",
		label: "Post-Election",
		years: ["2013", "2017", "2021", "2025"],
	},
	{
		id: "midterm",
		label: "Midterm",
		years: ["2014", "2018", "2022", "2026"],
	},
	{
		id: "pre-election",
		label: "Pre-Election",
		years: ["2011", "2015", "2019", "2023"],
	},
];

/** Dedicated colors for average lines — higher contrast than individual year colors */
export const AVG_COLORS_LIGHT: Record<string, string> = {
	election: "oklch(0.40 0.22 30)",
	"post-election": "oklch(0.40 0.22 145)",
	midterm: "oklch(0.40 0.22 260)",
	"pre-election": "oklch(0.40 0.22 310)",
	custom: "oklch(0.35 0.20 0)",
};

export const AVG_COLORS_DARK: Record<string, string> = {
	election: "oklch(0.85 0.18 30)",
	"post-election": "oklch(0.85 0.18 145)",
	midterm: "oklch(0.85 0.18 260)",
	"pre-election": "oklch(0.85 0.18 310)",
	custom: "oklch(0.90 0.16 0)",
};

/**
 * Peak months: the month containing each cycle's all-time high.
 * The exact peak day is resolved from data (highest price in the month).
 */
export const CYCLE_PEAK_MONTHS = [
	{ year: 2013, month: 11 },
	{ year: 2017, month: 12 },
	{ year: 2021, month: 11 },
	{ year: 2025, month: 10 },
] as const;

/**
 * Bottom months: the month containing each cycle's post-peak low.
 * The exact bottom day is resolved from data (lowest price in the month).
 */
export const CYCLE_BOTTOM_MONTHS = [
	{ year: 2015, month: 1 },
	{ year: 2018, month: 12 },
	{ year: 2022, month: 11 },
] as const;

export const CHART_MARGIN = {
	top: 20,
	right: 20,
	bottom: 40,
	left: 65,
} as const;
