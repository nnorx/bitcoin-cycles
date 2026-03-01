import { describe, expect, it, vi } from "vitest";
import type { ChartSeries } from "@/lib/bitcoin-types";
import { render, screen } from "@/test/test-utils";
import { ChartLegend } from "./ChartLegend";

const MOCK_SERIES: ChartSeries[] = [
	{
		id: "2020",
		label: "2020",
		color: "oklch(0.55 0.20 30)",
		data: [],
		visible: true,
	},
	{
		id: "2021",
		label: "2021",
		color: "oklch(0.55 0.20 60)",
		data: [],
		visible: true,
	},
	{
		id: "2022",
		label: "2022",
		color: "oklch(0.50 0.18 90)",
		data: [],
		visible: false,
	},
];

const defaultProps = {
	series: MOCK_SERIES,
	viewMode: "year" as const,
	onToggle: () => {},
	onShowAll: () => {},
	onHideAll: () => {},
};

describe("ChartLegend", () => {
	it("renders a toggle for each series", () => {
		render(<ChartLegend {...defaultProps} />);

		expect(screen.getByText("2020")).toBeInTheDocument();
		expect(screen.getByText("2021")).toBeInTheDocument();
		expect(screen.getByText("2022")).toBeInTheDocument();
	});

	it("calls onToggle with series id when clicked", async () => {
		const onToggle = vi.fn();
		const { user } = render(
			<ChartLegend {...defaultProps} onToggle={onToggle} />,
		);

		await user.click(screen.getByText("2021"));
		expect(onToggle).toHaveBeenCalledWith("2021");
	});

	it("calls onShowAll when All button is clicked", async () => {
		const onShowAll = vi.fn();
		const { user } = render(
			<ChartLegend {...defaultProps} onShowAll={onShowAll} />,
		);

		await user.click(screen.getByText("All"));
		expect(onShowAll).toHaveBeenCalledOnce();
	});

	it("calls onHideAll when None button is clicked", async () => {
		const onHideAll = vi.fn();
		const { user } = render(
			<ChartLegend {...defaultProps} onHideAll={onHideAll} />,
		);

		await user.click(screen.getByText("None"));
		expect(onHideAll).toHaveBeenCalledOnce();
	});

	it("reduces opacity for hidden series", () => {
		render(<ChartLegend {...defaultProps} />);

		const hiddenButton = screen.getByText("2022").closest("button");
		expect(hiddenButton).toHaveStyle({ opacity: "0.4" });
	});

	it("renders group quick-select buttons in year view", () => {
		const onGroupSelect = vi.fn();
		render(<ChartLegend {...defaultProps} onGroupSelect={onGroupSelect} />);

		expect(screen.getByText("Election")).toBeInTheDocument();
		expect(screen.getByText("Post-Election")).toBeInTheDocument();
		expect(screen.getByText("Midterm")).toBeInTheDocument();
		expect(screen.getByText("Pre-Election")).toBeInTheDocument();
	});

	it("does not render group buttons in epoch view", () => {
		const onGroupSelect = vi.fn();
		render(
			<ChartLegend
				{...defaultProps}
				viewMode="epoch"
				onGroupSelect={onGroupSelect}
			/>,
		);

		expect(screen.queryByText("Election")).not.toBeInTheDocument();
	});

	it("calls onGroupSelect with group id when clicked", async () => {
		const onGroupSelect = vi.fn();
		const { user } = render(
			<ChartLegend {...defaultProps} onGroupSelect={onGroupSelect} />,
		);

		await user.click(screen.getByText("Election"));
		expect(onGroupSelect).toHaveBeenCalledWith("election");
	});

	it("renders average toggle buttons in year view", () => {
		render(
			<ChartLegend
				{...defaultProps}
				onToggleAverage={() => {}}
				enabledAverages={new Set()}
				onToggleCustomAverage={() => {}}
			/>,
		);

		expect(screen.getByText("Avg: Election")).toBeInTheDocument();
		expect(screen.getByText("Avg: Visible")).toBeInTheDocument();
	});

	it("does not render average buttons in epoch view", () => {
		render(
			<ChartLegend
				{...defaultProps}
				viewMode="epoch"
				onToggleAverage={() => {}}
				enabledAverages={new Set()}
			/>,
		);

		expect(screen.queryByText("Avg: Election")).not.toBeInTheDocument();
	});

	it("calls onToggleAverage when an average button is clicked", async () => {
		const onToggleAverage = vi.fn();
		const { user } = render(
			<ChartLegend
				{...defaultProps}
				onToggleAverage={onToggleAverage}
				enabledAverages={new Set()}
			/>,
		);

		await user.click(screen.getByText("Avg: Election"));
		expect(onToggleAverage).toHaveBeenCalledWith("avg-election");
	});
});
