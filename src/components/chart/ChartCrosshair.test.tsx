import { render, screen } from "@testing-library/react";
import { scaleLinear } from "d3-scale";
import { describe, expect, it } from "vitest";
import type { ChartSeries } from "@/lib/bitcoin-types";
import { ChartCrosshair } from "./ChartCrosshair";

const xScale = scaleLinear().domain([1, 366]).range([0, 1000]);

const SERIES: ChartSeries[] = [
	{
		id: "a",
		label: "A",
		color: "red",
		visible: true,
		data: [
			{ day: 1, percentReturn: 10, price: 100 },
			{ day: 100, percentReturn: 50, price: 500 },
		],
	},
	{
		id: "b",
		label: "B",
		color: "blue",
		visible: true,
		data: [
			{ day: 1, percentReturn: 5, price: 50 },
			{ day: 100, percentReturn: 80, price: 800 },
		],
	},
];

function renderAt(day: number) {
	return render(
		<svg>
			<title>chart</title>
			<ChartCrosshair
				mouseX={xScale(day)}
				series={SERIES}
				xScale={xScale}
				viewMode="year"
				height={400}
				width={1000}
			/>
		</svg>,
	);
}

describe("ChartCrosshair", () => {
	it("labels the header with a calendar date in year view", () => {
		renderAt(100); // day-of-year 100 → Apr 10
		expect(screen.getByText("Apr 10")).toBeInTheDocument();
	});

	it("shows the actual USD price per series", () => {
		renderAt(100);
		expect(screen.getByText("$800")).toBeInTheDocument();
		expect(screen.getByText("$500")).toBeInTheDocument();
	});

	it("orders rows as a leaderboard, highest return first", () => {
		const { container } = renderAt(100);
		const text = container.textContent ?? "";
		// B (+80%) should appear before A (+50%).
		expect(text.indexOf("+80.0%")).toBeLessThan(text.indexOf("+50.0%"));
	});
});
