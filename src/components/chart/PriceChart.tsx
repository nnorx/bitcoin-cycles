import { extent } from "d3-array";
import { scaleLinear, scaleLog } from "d3-scale";
import { useCallback, useMemo, useRef, useState } from "react";
import { useContainerSize } from "@/hooks/use-container-size";
import { CHART_MARGIN } from "@/lib/bitcoin-constants";
import type { ChartSeries, ScaleMode, ViewMode } from "@/lib/bitcoin-types";
import { ChartAxes } from "./ChartAxes";
import { ChartCrosshair } from "./ChartCrosshair";
import { ChartLine } from "./ChartLine";

interface PriceChartProps {
	series: ChartSeries[];
	viewMode: ViewMode;
	scaleMode: ScaleMode;
}

export function PriceChart({ series, viewMode, scaleMode }: PriceChartProps) {
	const containerRef = useRef<HTMLDivElement>(null);
	const { width, height } = useContainerSize(containerRef);
	const [mouseX, setMouseX] = useState<number | null>(null);

	const innerWidth = width - CHART_MARGIN.left - CHART_MARGIN.right;
	const innerHeight = height - CHART_MARGIN.top - CHART_MARGIN.bottom;

	const visibleSeries = useMemo(
		() => series.filter((s) => s.visible),
		[series],
	);

	const xScale = useMemo(() => {
		const maxDay = viewMode === "year" ? 366 : 1461;
		return scaleLinear()
			.domain([viewMode === "year" ? 1 : 0, maxDay])
			.range([0, innerWidth]);
	}, [viewMode, innerWidth]);

	const yScale = useMemo(() => {
		if (visibleSeries.length === 0) {
			return scaleLinear().domain([-100, 100]).range([innerHeight, 0]);
		}

		const allValues = visibleSeries.flatMap((s) =>
			s.data.map((d) =>
				scaleMode === "log" ? 1 + d.percentReturn / 100 : d.percentReturn,
			),
		);

		const [min, max] = extent(allValues);
		const safeMin = min ?? (scaleMode === "log" ? 0.1 : -100);
		const safeMax = max ?? (scaleMode === "log" ? 10 : 100);

		if (scaleMode === "log") {
			return scaleLog()
				.domain([Math.max(0.01, safeMin * 0.9), safeMax * 1.1])
				.range([innerHeight, 0])
				.clamp(true);
		}

		const padding = (safeMax - safeMin) * 0.05;
		return scaleLinear()
			.domain([safeMin - padding, safeMax + padding])
			.range([innerHeight, 0])
			.nice();
	}, [visibleSeries, scaleMode, innerHeight]);

	const handleMouseMove = useCallback(
		(e: React.MouseEvent<SVGRectElement>) => {
			const rect = e.currentTarget.getBoundingClientRect();
			const x = e.clientX - rect.left;
			setMouseX(Math.max(0, Math.min(x, innerWidth)));
		},
		[innerWidth],
	);

	const handleMouseLeave = useCallback(() => setMouseX(null), []);

	const handleTouchMove = useCallback(
		(e: React.TouchEvent<SVGRectElement>) => {
			const touch = e.touches[0];
			if (!touch) return;
			const rect = e.currentTarget.getBoundingClientRect();
			const x = touch.clientX - rect.left;
			setMouseX(Math.max(0, Math.min(x, innerWidth)));
		},
		[innerWidth],
	);

	if (width === 0 || height === 0) {
		return (
			<div
				ref={containerRef}
				className="h-[500px] w-full md:h-[600px] lg:h-[700px]"
			/>
		);
	}

	return (
		<div
			ref={containerRef}
			className="h-[500px] w-full md:h-[600px] lg:h-[700px]"
		>
			<svg
				width={width}
				height={height}
				role="img"
				aria-label="Bitcoin price cycle chart"
			>
				<g transform={`translate(${CHART_MARGIN.left},${CHART_MARGIN.top})`}>
					<ChartAxes
						xScale={xScale}
						yScale={yScale}
						width={innerWidth}
						height={innerHeight}
						scaleMode={scaleMode}
						viewMode={viewMode}
					/>

					{visibleSeries.map((s) => (
						<ChartLine
							key={s.id}
							series={s}
							xScale={xScale}
							yScale={yScale}
							scaleMode={scaleMode}
						/>
					))}

					<ChartCrosshair
						mouseX={mouseX}
						series={series}
						xScale={xScale}
						viewMode={viewMode}
						height={innerHeight}
						width={innerWidth}
					/>

					{/* biome-ignore lint/a11y/noStaticElementInteractions: SVG overlay for chart crosshair tracking */}
					<rect
						width={innerWidth}
						height={innerHeight}
						fill="transparent"
						onMouseMove={handleMouseMove}
						onMouseLeave={handleMouseLeave}
						onTouchMove={handleTouchMove}
						onTouchEnd={handleMouseLeave}
					/>
				</g>
			</svg>
		</div>
	);
}
