import {
	HALVING_DATES,
	SERIES_COLORS_DARK,
	SERIES_COLORS_LIGHT,
} from "./bitcoin-constants";
import type { ChartSeries, DailyPrice, SeriesPoint } from "./bitcoin-types";

function dayOfYear(date: Date): number {
	const start = Date.UTC(date.getUTCFullYear(), 0, 1);
	return Math.floor((date.getTime() - start) / (24 * 60 * 60 * 1000)) + 1;
}

function daysBetween(a: Date, b: Date): number {
	return Math.floor((b.getTime() - a.getTime()) / (24 * 60 * 60 * 1000));
}

function getColor(index: number, isDark: boolean): string {
	const palette = isDark ? SERIES_COLORS_DARK : SERIES_COLORS_LIGHT;
	return palette[index % palette.length] ?? "oklch(0.5 0 0)";
}

export function buildYearSeries(
	data: DailyPrice[],
	isDark: boolean,
): ChartSeries[] {
	const byYear = new Map<number, DailyPrice[]>();

	for (const d of data) {
		const year = d.date.getUTCFullYear();
		let arr = byYear.get(year);
		if (!arr) {
			arr = [];
			byYear.set(year, arr);
		}
		arr.push(d);
	}

	const years = [...byYear.keys()].sort((a, b) => a - b);

	return years.flatMap((year, i) => {
		const prices = byYear.get(year);
		if (!prices || prices.length === 0) return [];

		const first = prices[0];
		if (!first) return [];
		const baseline = first.price;

		const points: SeriesPoint[] = prices.map((d) => ({
			day: dayOfYear(d.date),
			percentReturn: ((d.price - baseline) / baseline) * 100,
		}));

		return [
			{
				id: String(year),
				label: String(year),
				color: getColor(i, isDark),
				data: points,
				visible: true,
			},
		];
	});
}

export function buildEpochSeries(
	data: DailyPrice[],
	isDark: boolean,
): ChartSeries[] {
	const epochs: ChartSeries[] = [];
	const halvings = [...HALVING_DATES];

	const boundaries: Array<{ start: Date; end: Date; label: string }> = [];

	for (let i = 0; i < halvings.length; i++) {
		const start = halvings[i];
		if (!start) continue;
		const end = halvings[i + 1] ?? new Date();
		const epochNum = i + 1;
		const startYear = start.getUTCFullYear();
		const endYear = end.getUTCFullYear();
		boundaries.push({
			start,
			end,
			label: `Cycle ${epochNum} (${startYear}–${endYear})`,
		});
	}

	for (let i = 0; i < boundaries.length; i++) {
		const boundary = boundaries[i];
		if (!boundary) continue;
		const { start, end, label } = boundary;
		const epochData = data.filter((d) => d.date >= start && d.date < end);

		if (epochData.length === 0) continue;

		const first = epochData[0];
		if (!first) continue;
		const baseline = first.price;

		const points: SeriesPoint[] = epochData.map((d) => ({
			day: daysBetween(start, d.date),
			percentReturn: ((d.price - baseline) / baseline) * 100,
		}));

		epochs.push({
			id: `epoch-${i + 1}`,
			label,
			color: getColor(i, isDark),
			data: points,
			visible: true,
		});
	}

	return epochs;
}

/**
 * Build an average ChartSeries from a subset of year series.
 * For each day (1–366), averages percentReturn across all input series
 * that have data for that day.
 */
export function buildAverageSeries(
	yearSeriesList: ChartSeries[],
	id: string,
	label: string,
	color: string,
): ChartSeries {
	const dayMap = new Map<number, number[]>();

	for (const series of yearSeriesList) {
		for (const point of series.data) {
			let arr = dayMap.get(point.day);
			if (!arr) {
				arr = [];
				dayMap.set(point.day, arr);
			}
			arr.push(point.percentReturn);
		}
	}

	const data: SeriesPoint[] = [...dayMap.entries()]
		.sort((a, b) => a[0] - b[0])
		.map(([day, values]) => ({
			day,
			percentReturn: values.reduce((sum, v) => sum + v, 0) / values.length,
		}));

	return { id, label, color, data, visible: true, dashed: true };
}
