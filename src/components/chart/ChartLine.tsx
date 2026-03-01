import type { ScaleLinear, ScaleLogarithmic } from "d3-scale";
import { line } from "d3-shape";
import { useMemo } from "react";
import type { ChartSeries, ScaleMode } from "@/lib/bitcoin-types";

interface ChartLineProps {
	series: ChartSeries;
	xScale: ScaleLinear<number, number>;
	yScale: ScaleLinear<number, number> | ScaleLogarithmic<number, number>;
	scaleMode: ScaleMode;
}

export function ChartLine({
	series,
	xScale,
	yScale,
	scaleMode,
}: ChartLineProps) {
	const pathD = useMemo(() => {
		const generator = line<{ day: number; percentReturn: number }>()
			.x((d) => xScale(d.day))
			.y((d) => {
				const val =
					scaleMode === "log" ? 1 + d.percentReturn / 100 : d.percentReturn;
				return yScale(val);
			})
			.defined((d) => {
				if (!Number.isFinite(d.percentReturn)) return false;
				if (scaleMode === "log" && 1 + d.percentReturn / 100 <= 0) return false;
				return true;
			});

		return generator(series.data);
	}, [series.data, xScale, yScale, scaleMode]);

	if (!pathD) return null;

	return (
		<path
			d={pathD}
			fill="none"
			stroke={series.color}
			strokeWidth={series.dashed ? 2.5 : 1.5}
			strokeLinejoin="round"
			strokeDasharray={series.dashed ? "8 4" : undefined}
		/>
	);
}
