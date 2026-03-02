import {
	CYCLE_BOTTOM_MONTHS,
	CYCLE_PEAK_MONTHS,
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

function findExtremeInMonth(
	data: DailyPrice[],
	year: number,
	month: number,
	mode: "max" | "min",
): DailyPrice | undefined {
	const candidates = data.filter(
		(d) =>
			d.date.getUTCFullYear() === year && d.date.getUTCMonth() + 1 === month,
	);
	if (candidates.length === 0) return undefined;
	return candidates.reduce((best, d) =>
		mode === "max"
			? d.price > best.price
				? d
				: best
			: d.price < best.price
				? d
				: best,
	);
}

export function buildPeakTroughSeries(
	data: DailyPrice[],
	isDark: boolean,
): ChartSeries[] {
	const peaks = CYCLE_PEAK_MONTHS.map((pm) =>
		findExtremeInMonth(data, pm.year, pm.month, "max"),
	).filter((d): d is DailyPrice => d !== undefined);

	const bottoms = CYCLE_BOTTOM_MONTHS.map((bm) =>
		findExtremeInMonth(data, bm.year, bm.month, "min"),
	).filter((d): d is DailyPrice => d !== undefined);

	return peaks.flatMap((peak, i) => {
		const bottom = bottoms[i];
		const endDate = bottom ? bottom.date : new Date();
		const epochData = data.filter(
			(d) => d.date >= peak.date && d.date <= endDate,
		);
		if (epochData.length === 0) return [];

		const baseline = peak.price;
		const startYear = peak.date.getUTCFullYear();
		const endYear = endDate.getUTCFullYear();
		const suffix = bottom ? "" : " (ongoing)";

		return [
			{
				id: `peak-trough-${i + 1}`,
				label: `Peak ${i + 1} (${startYear}–${endYear})${suffix}`,
				color: getColor(i, isDark),
				data: epochData.map((d) => ({
					day: daysBetween(peak.date, d.date),
					percentReturn: ((d.price - baseline) / baseline) * 100,
				})),
				visible: true,
			},
		];
	});
}

export function buildTroughPeakSeries(
	data: DailyPrice[],
	isDark: boolean,
): ChartSeries[] {
	const peaks = CYCLE_PEAK_MONTHS.map((pm) =>
		findExtremeInMonth(data, pm.year, pm.month, "max"),
	).filter((d): d is DailyPrice => d !== undefined);

	const bottoms = CYCLE_BOTTOM_MONTHS.map((bm) =>
		findExtremeInMonth(data, bm.year, bm.month, "min"),
	).filter((d): d is DailyPrice => d !== undefined);

	return bottoms.flatMap((bottom, i) => {
		const nextPeak = peaks[i + 1];
		const endDate = nextPeak ? nextPeak.date : new Date();
		const epochData = data.filter(
			(d) => d.date >= bottom.date && d.date <= endDate,
		);
		if (epochData.length === 0) return [];

		const baseline = bottom.price;
		const startYear = bottom.date.getUTCFullYear();
		const endYear = endDate.getUTCFullYear();
		const suffix = nextPeak ? "" : " (ongoing)";

		return [
			{
				id: `trough-peak-${i + 1}`,
				label: `Recovery ${i + 1} (${startYear}–${endYear})${suffix}`,
				color: getColor(i, isDark),
				data: epochData.map((d) => ({
					day: daysBetween(bottom.date, d.date),
					percentReturn: ((d.price - baseline) / baseline) * 100,
				})),
				visible: true,
			},
		];
	});
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
