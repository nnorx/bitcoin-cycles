import { describe, expect, it } from "vitest";
import {
	buildAverageSeries,
	buildEpochSeries,
	buildPeakTroughSeries,
	buildTroughPeakSeries,
	buildYearSeries,
} from "./bitcoin-transforms";
import type { ChartSeries, DailyPrice } from "./bitcoin-types";

function makePrice(dateStr: string, price: number): DailyPrice {
	return { date: new Date(`${dateStr}T00:00:00Z`), price };
}

const SAMPLE_DATA: DailyPrice[] = [
	// 2020
	makePrice("2020-01-01", 7200),
	makePrice("2020-01-02", 7300),
	makePrice("2020-06-15", 9400),
	makePrice("2020-12-31", 29000),
	// 2021
	makePrice("2021-01-01", 29300),
	makePrice("2021-04-14", 64000),
	makePrice("2021-12-31", 46300),
	// 2022
	makePrice("2022-01-01", 46200),
	makePrice("2022-06-18", 18900),
	makePrice("2022-12-31", 16500),
];

describe("buildYearSeries", () => {
	it("creates one series per year", () => {
		const series = buildYearSeries(SAMPLE_DATA, false);
		expect(series).toHaveLength(3);
		expect(series.map((s) => s.id)).toEqual(["2020", "2021", "2022"]);
	});

	it("normalizes prices to percent return from Jan 1", () => {
		const series = buildYearSeries(SAMPLE_DATA, false);
		const y2020 = series.find((s) => s.id === "2020");
		expect(y2020).toBeDefined();

		// First data point should be 0% return
		expect(y2020?.data[0]?.percentReturn).toBe(0);

		// Last data point: (29000 - 7200) / 7200 * 100 ≈ 302.78%
		const lastPoint = y2020?.data[y2020.data.length - 1];
		expect(lastPoint?.percentReturn).toBeCloseTo(302.78, 0);
	});

	it("assigns correct day-of-year values", () => {
		const series = buildYearSeries(SAMPLE_DATA, false);
		const y2020 = series.find((s) => s.id === "2020");

		// Jan 1 = day 1
		expect(y2020?.data[0]?.day).toBe(1);
		// Jan 2 = day 2
		expect(y2020?.data[1]?.day).toBe(2);
	});

	it("sets all series as visible by default", () => {
		const series = buildYearSeries(SAMPLE_DATA, false);
		for (const s of series) {
			expect(s.visible).toBe(true);
		}
	});

	it("returns series sorted by year ascending", () => {
		const series = buildYearSeries(SAMPLE_DATA, false);
		const years = series.map((s) => Number.parseInt(s.id, 10));
		expect(years).toEqual([...years].sort((a, b) => a - b));
	});

	it("assigns colors from light palette when isDark is false", () => {
		const series = buildYearSeries(SAMPLE_DATA, false);
		for (const s of series) {
			expect(s.color).toContain("oklch");
		}
	});

	it("assigns different colors for dark mode", () => {
		const lightSeries = buildYearSeries(SAMPLE_DATA, false);
		const darkSeries = buildYearSeries(SAMPLE_DATA, true);

		expect(lightSeries[0]?.color).not.toBe(darkSeries[0]?.color);
	});
});

describe("buildEpochSeries", () => {
	// Use data spanning halving dates for epoch tests
	const EPOCH_DATA: DailyPrice[] = [
		// Epoch 3 (halving 2016-07-09 to 2020-05-11)
		makePrice("2016-07-09", 650),
		makePrice("2016-07-10", 660),
		makePrice("2017-12-17", 19700),
		makePrice("2020-05-10", 8700),
		// Epoch 4 (halving 2020-05-11 to 2024-04-19)
		makePrice("2020-05-11", 8800),
		makePrice("2020-05-12", 8900),
		makePrice("2021-11-10", 69000),
		makePrice("2024-04-18", 64000),
		// Epoch 5 (halving 2024-04-19 to present)
		makePrice("2024-04-19", 64500),
		makePrice("2024-04-20", 65000),
	];

	it("creates series aligned to halving dates", () => {
		const series = buildEpochSeries(EPOCH_DATA, false);
		expect(series.length).toBeGreaterThan(0);

		// Each epoch should start at day 0
		for (const s of series) {
			expect(s.data[0]?.day).toBe(0);
		}
	});

	it("normalizes to percent return from halving price", () => {
		const series = buildEpochSeries(EPOCH_DATA, false);
		// First point of each epoch should be 0% return
		for (const s of series) {
			expect(s.data[0]?.percentReturn).toBe(0);
		}
	});

	it("computes days-since-halving correctly", () => {
		const series = buildEpochSeries(EPOCH_DATA, false);
		const epoch3 = series.find((s) => s.id === "epoch-3");
		expect(epoch3).toBeDefined();

		// Day 0 = halving day, Day 1 = next day
		expect(epoch3?.data[0]?.day).toBe(0);
		expect(epoch3?.data[1]?.day).toBe(1);
	});

	it("labels epochs with cycle number and year range", () => {
		const series = buildEpochSeries(EPOCH_DATA, false);
		for (const s of series) {
			expect(s.label).toContain("Cycle");
		}
	});

	it("sets all epochs visible by default", () => {
		const series = buildEpochSeries(EPOCH_DATA, false);
		for (const s of series) {
			expect(s.visible).toBe(true);
		}
	});
});

describe("buildAverageSeries", () => {
	const makeSeries = (
		id: string,
		data: Array<{ day: number; percentReturn: number }>,
	): ChartSeries => ({
		id,
		label: id,
		color: "#000",
		data,
		visible: true,
	});

	it("averages percentReturn across series for each day", () => {
		const a = makeSeries("2020", [
			{ day: 1, percentReturn: 0 },
			{ day: 2, percentReturn: 10 },
			{ day: 3, percentReturn: 30 },
		]);
		const b = makeSeries("2021", [
			{ day: 1, percentReturn: 0 },
			{ day: 2, percentReturn: 20 },
			{ day: 3, percentReturn: 60 },
		]);

		const avg = buildAverageSeries([a, b], "avg-test", "Avg", "#fff");
		expect(avg.data).toHaveLength(3);
		expect(avg.data[0]?.percentReturn).toBe(0);
		expect(avg.data[1]?.percentReturn).toBe(15);
		expect(avg.data[2]?.percentReturn).toBe(45);
	});

	it("handles days present in only some series", () => {
		const a = makeSeries("2020", [
			{ day: 1, percentReturn: 0 },
			{ day: 2, percentReturn: 50 },
		]);
		const b = makeSeries("2021", [{ day: 1, percentReturn: 100 }]);

		const avg = buildAverageSeries([a, b], "avg-test", "Avg", "#fff");
		expect(avg.data).toHaveLength(2);
		expect(avg.data[0]?.percentReturn).toBe(50);
		expect(avg.data[1]?.percentReturn).toBe(50);
	});

	it("returns empty data for empty input", () => {
		const avg = buildAverageSeries([], "avg-test", "Avg", "#fff");
		expect(avg.data).toHaveLength(0);
	});

	it("sets dashed to true", () => {
		const avg = buildAverageSeries([], "avg-test", "Avg", "#fff");
		expect(avg.dashed).toBe(true);
	});

	it("returns data sorted by day ascending", () => {
		const s = makeSeries("2020", [
			{ day: 100, percentReturn: 5 },
			{ day: 1, percentReturn: 0 },
			{ day: 50, percentReturn: 3 },
		]);

		const avg = buildAverageSeries([s], "avg-test", "Avg", "#fff");
		const days = avg.data.map((d) => d.day);
		expect(days).toEqual([1, 50, 100]);
	});
});

describe("buildPeakTroughSeries", () => {
	const PEAK_BOTTOM_DATA: DailyPrice[] = [
		// Nov 2013 — peak month. Highest price = 1100 on Nov 29
		makePrice("2013-11-01", 200),
		makePrice("2013-11-15", 800),
		makePrice("2013-11-29", 1100),
		// Mid-cycle decline
		makePrice("2014-06-15", 600),
		// Jan 2015 — bottom month. Lowest price = 180 on Jan 14
		makePrice("2015-01-01", 300),
		makePrice("2015-01-14", 180),
		makePrice("2015-01-31", 220),
	];

	it("creates a series from peak to bottom", () => {
		const series = buildPeakTroughSeries(PEAK_BOTTOM_DATA, false);
		expect(series.length).toBeGreaterThanOrEqual(1);

		const first = series[0];
		expect(first?.id).toBe("peak-trough-1");
		expect(first?.label).toContain("Peak 1");
		expect(first?.label).toContain("2013");
		expect(first?.visible).toBe(true);
	});

	it("starts at day 0 with 0% return", () => {
		const series = buildPeakTroughSeries(PEAK_BOTTOM_DATA, false);
		const first = series[0];
		expect(first?.data[0]?.day).toBe(0);
		expect(first?.data[0]?.percentReturn).toBe(0);
	});

	it("picks the highest price day in the peak month as baseline", () => {
		const series = buildPeakTroughSeries(PEAK_BOTTOM_DATA, false);
		const first = series[0];

		// Baseline = 1100 (Nov 29, highest in Nov 2013)
		// Price 600 on 2014-06-15: (600 - 1100) / 1100 * 100 ≈ -45.45%
		const midPoint = first?.data.find(
			(d) => d.percentReturn < -40 && d.percentReturn > -50,
		);
		expect(midPoint).toBeDefined();
	});

	it("shows negative returns during decline", () => {
		const series = buildPeakTroughSeries(PEAK_BOTTOM_DATA, false);
		const first = series[0];
		const lastPoint = first?.data.at(-1);
		expect(lastPoint?.percentReturn).toBeLessThan(0);
	});
});

describe("buildTroughPeakSeries", () => {
	const BOTTOM_PEAK_DATA: DailyPrice[] = [
		// Jan 2015 — bottom month. Lowest = 180 on Jan 14
		makePrice("2015-01-01", 300),
		makePrice("2015-01-14", 180),
		makePrice("2015-01-31", 220),
		// Mid-cycle rise
		makePrice("2016-06-15", 700),
		// Dec 2017 — peak month. Highest = 19000 on Dec 17
		makePrice("2017-12-01", 10000),
		makePrice("2017-12-17", 19000),
		makePrice("2017-12-31", 14000),
	];

	it("creates a series from bottom to peak", () => {
		const series = buildTroughPeakSeries(BOTTOM_PEAK_DATA, false);
		expect(series.length).toBeGreaterThanOrEqual(1);

		const first = series[0];
		expect(first?.id).toBe("trough-peak-1");
		expect(first?.label).toContain("Recovery 1");
		expect(first?.label).toContain("2015");
		expect(first?.visible).toBe(true);
	});

	it("starts at day 0 with 0% return", () => {
		const series = buildTroughPeakSeries(BOTTOM_PEAK_DATA, false);
		const first = series[0];
		expect(first?.data[0]?.day).toBe(0);
		expect(first?.data[0]?.percentReturn).toBe(0);
	});

	it("picks the lowest price day in the bottom month as baseline", () => {
		const series = buildTroughPeakSeries(BOTTOM_PEAK_DATA, false);
		const first = series[0];

		// Baseline = 180 (Jan 14, lowest in Jan 2015)
		// Price 19000 on Dec 17, 2017: (19000 - 180) / 180 * 100 ≈ 10455.6%
		const peakPoint = first?.data.find((d) => d.percentReturn > 10000);
		expect(peakPoint).toBeDefined();
	});

	it("shows positive returns during recovery", () => {
		const series = buildTroughPeakSeries(BOTTOM_PEAK_DATA, false);
		const first = series[0];
		const lastPoint = first?.data.at(-1);
		expect(lastPoint?.percentReturn).toBeGreaterThan(0);
	});
});
