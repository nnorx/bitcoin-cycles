import { describe, expect, it } from "vitest";
import type { SeriesPoint } from "./bitcoin-types";
import { nearestPoint } from "./nearest-point";

const DATA: SeriesPoint[] = [
	{ day: 1, percentReturn: 0 },
	{ day: 10, percentReturn: 5 },
	{ day: 20, percentReturn: -3 },
];

describe("nearestPoint", () => {
	it("returns undefined for empty data", () => {
		expect(nearestPoint([], 5)).toBeUndefined();
	});

	it("returns the exact point when day matches", () => {
		expect(nearestPoint(DATA, 10)?.day).toBe(10);
	});

	it("snaps to the closer neighbor between two points", () => {
		expect(nearestPoint(DATA, 3)?.day).toBe(1);
		expect(nearestPoint(DATA, 8)?.day).toBe(10);
	});

	it("clamps to the first and last points beyond the range", () => {
		expect(nearestPoint(DATA, -5)?.day).toBe(1);
		expect(nearestPoint(DATA, 100)?.day).toBe(20);
	});
});
