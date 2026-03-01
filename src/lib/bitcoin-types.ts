/** Raw price point from CoinGecko: [timestamp_ms, price_usd] */
export type RawPricePoint = [timestamp: number, price: number];

/** Processed daily data point */
export interface DailyPrice {
	date: Date;
	price: number;
}

/** A single normalized point for chart rendering */
export interface SeriesPoint {
	/** X-axis value: day-of-year (1-366) or days-since-halving (0-1460) */
	day: number;
	/** Y-axis value: % change from baseline (Jan 1 or halving day) */
	percentReturn: number;
}

/** A complete series ready for D3 rendering */
export interface ChartSeries {
	id: string;
	label: string;
	color: string;
	data: SeriesPoint[];
	visible: boolean;
	/** When true, render as a dashed line (used for averages) */
	dashed?: boolean;
}

/** A named group of years for quick-select and averaging */
export interface YearGroup {
	id: string;
	label: string;
	years: string[];
}

export type ViewMode = "year" | "epoch";
export type ScaleMode = "linear" | "log";
