import { describe, expect, it } from "vitest";
import {
	type ChartUrlState,
	DEFAULT_URL_STATE,
	parseUrlState,
	serializeUrlState,
} from "./url-state";

describe("parseUrlState", () => {
	it("returns defaults for an empty search string", () => {
		expect(parseUrlState("")).toEqual(DEFAULT_URL_STATE);
	});

	it("parses view and scale", () => {
		const state = parseUrlState("?view=epoch&scale=linear");
		expect(state.viewMode).toBe("epoch");
		expect(state.scaleMode).toBe("linear");
	});

	it("falls back to defaults for unknown view/scale values", () => {
		const state = parseUrlState("?view=bogus&scale=nope");
		expect(state.viewMode).toBe("year");
		expect(state.scaleMode).toBe("log");
	});

	it("parses a series allow-list", () => {
		const state = parseUrlState("?series=2017,2021,2025");
		expect(state.visibleIds).toEqual(new Set(["2017", "2021", "2025"]));
	});

	it("treats the 'none' sentinel as an empty visible set", () => {
		const state = parseUrlState("?series=none");
		expect(state.visibleIds).toEqual(new Set());
	});

	it("leaves visibleIds null when series is absent", () => {
		expect(parseUrlState("?view=epoch").visibleIds).toBeNull();
	});

	it("parses group and custom averages, ignoring unknown tokens", () => {
		const state = parseUrlState("?avg=election,visible,garbage");
		expect(state.enabledAverages).toEqual(new Set(["avg-election"]));
		expect(state.showCustomAverage).toBe(true);
	});
});

describe("serializeUrlState", () => {
	it("emits nothing when everything is default", () => {
		expect(serializeUrlState(DEFAULT_URL_STATE)).toBe("");
	});

	it("omits default view and scale", () => {
		const state: ChartUrlState = {
			...DEFAULT_URL_STATE,
			viewMode: "year",
			scaleMode: "log",
		};
		expect(serializeUrlState(state)).toBe("");
	});

	it("serializes non-default view and scale", () => {
		const state: ChartUrlState = {
			...DEFAULT_URL_STATE,
			viewMode: "peak-trough",
			scaleMode: "linear",
		};
		expect(serializeUrlState(state)).toBe("?view=peak-trough&scale=linear");
	});

	it("serializes a sorted series list", () => {
		const state: ChartUrlState = {
			...DEFAULT_URL_STATE,
			visibleIds: new Set(["2021", "2017"]),
		};
		expect(serializeUrlState(state)).toBe("?series=2017,2021");
	});

	it("serializes an empty visible set as 'none'", () => {
		const state: ChartUrlState = {
			...DEFAULT_URL_STATE,
			visibleIds: new Set(),
		};
		expect(serializeUrlState(state)).toBe("?series=none");
	});

	it("serializes averages in a stable order with custom last", () => {
		const state: ChartUrlState = {
			...DEFAULT_URL_STATE,
			enabledAverages: new Set(["avg-midterm", "avg-election"]),
			showCustomAverage: true,
		};
		expect(serializeUrlState(state)).toBe("?avg=election,midterm,visible");
	});
});

describe("round-trip", () => {
	it("parse(serialize(state)) preserves state", () => {
		const state: ChartUrlState = {
			viewMode: "trough-peak",
			scaleMode: "linear",
			visibleIds: new Set(["trough-peak-1", "trough-peak-3"]),
			enabledAverages: new Set(["avg-pre-election"]),
			showCustomAverage: true,
		};
		expect(parseUrlState(serializeUrlState(state))).toEqual(state);
	});
});
