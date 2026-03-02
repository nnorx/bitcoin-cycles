import { format as d3Format } from "d3-format";
import type { ScaleLinear, ScaleLogarithmic } from "d3-scale";
import { useMemo } from "react";
import type { ScaleMode, ViewMode } from "@/lib/bitcoin-types";

interface ChartAxesProps {
	xScale: ScaleLinear<number, number>;
	yScale: ScaleLinear<number, number> | ScaleLogarithmic<number, number>;
	width: number;
	height: number;
	scaleMode: ScaleMode;
	viewMode: ViewMode;
}

const MONTH_LABELS = [
	"Jan",
	"Feb",
	"Mar",
	"Apr",
	"May",
	"Jun",
	"Jul",
	"Aug",
	"Sep",
	"Oct",
	"Nov",
	"Dec",
];

/** Day-of-year for the 1st of each month (non-leap year) */
const MONTH_STARTS = [1, 32, 60, 91, 121, 152, 182, 213, 244, 274, 305, 335];

const EPOCH_YEAR_TICKS = [0, 365, 730, 1095, 1460];

export function ChartAxes({
	xScale,
	yScale,
	width,
	height,
	scaleMode,
	viewMode,
}: ChartAxesProps) {
	const xTicks = useMemo(() => {
		if (viewMode === "year") {
			return MONTH_STARTS.map((day, i) => ({
				value: day,
				label: MONTH_LABELS[i] ?? "",
			}));
		}
		if (viewMode === "epoch") {
			return EPOCH_YEAR_TICKS.map((day) => ({
				value: day,
				label: `Y${day / 365}`,
			}));
		}
		if (viewMode === "peak-trough") {
			const ticks: Array<{ value: number; label: string }> = [];
			for (let m = 0; m <= 14; m++) {
				ticks.push({ value: m * 30, label: `${m}m` });
			}
			return ticks;
		}
		// trough-peak
		return [0, 365, 730, 1095].map((day) => ({
			value: day,
			label: `Y${day / 365}`,
		}));
	}, [viewMode]);

	const yTicks = useMemo(() => {
		const ticks = yScale.ticks(8);
		const formatPercent = d3Format("+,.0f");

		return ticks.map((tick) => {
			let label: string;
			if (scaleMode === "log") {
				const pct = (tick - 1) * 100;
				label = `${formatPercent(pct)}%`;
			} else {
				label = `${formatPercent(tick)}%`;
			}
			return { value: tick, label };
		});
	}, [yScale, scaleMode]);

	const zeroY = useMemo(() => {
		const zeroVal = scaleMode === "log" ? 1 : 0;
		const domain = yScale.domain();
		const domainMin = domain[0] ?? 0;
		const domainMax = domain[1] ?? 0;
		if (zeroVal < domainMin || zeroVal > domainMax) return null;
		return yScale(zeroVal);
	}, [yScale, scaleMode]);

	return (
		<g>
			{/* Horizontal grid lines */}
			{yTicks.map((tick) => (
				<line
					key={`grid-${tick.value}`}
					x1={0}
					x2={width}
					y1={yScale(tick.value)}
					y2={yScale(tick.value)}
					stroke="var(--border)"
					strokeWidth={0.5}
				/>
			))}

			{/* Zero reference line */}
			{zeroY != null && (
				<line
					x1={0}
					x2={width}
					y1={zeroY}
					y2={zeroY}
					stroke="var(--muted-foreground)"
					strokeWidth={1}
					strokeDasharray="4 3"
				/>
			)}

			{/* Y-axis labels */}
			{yTicks.map((tick) => (
				<text
					key={`y-${tick.value}`}
					x={-8}
					y={yScale(tick.value)}
					textAnchor="end"
					dominantBaseline="middle"
					fontSize={11}
					fill="var(--muted-foreground)"
				>
					{tick.label}
				</text>
			))}

			{/* X-axis labels */}
			{xTicks.map((tick) => (
				<text
					key={`x-${tick.value}`}
					x={xScale(tick.value)}
					y={height + 24}
					textAnchor="middle"
					fontSize={11}
					fill="var(--muted-foreground)"
				>
					{tick.label}
				</text>
			))}

			{/* X-axis tick marks */}
			{xTicks.map((tick) => (
				<line
					key={`xtick-${tick.value}`}
					x1={xScale(tick.value)}
					x2={xScale(tick.value)}
					y1={height}
					y2={height + 6}
					stroke="var(--muted-foreground)"
					strokeWidth={0.5}
				/>
			))}
		</g>
	);
}
