import { extent } from "d3-array";
import { scaleLinear, scaleLog } from "d3-scale";
import { useCallback, useMemo, useRef, useState } from "react";
import { useContainerSize } from "@/hooks/use-container-size";
import { CHART_MARGIN } from "@/lib/bitcoin-constants";
import type { ChartSeries, ScaleMode, ViewMode } from "@/lib/bitcoin-types";
import { nearestPoint } from "@/lib/nearest-point";
import { ChartAxes } from "./ChartAxes";
import { ChartCrosshair } from "./ChartCrosshair";
import { ChartLine } from "./ChartLine";

/** Max vertical distance (px) from a line for it to count as hovered */
const HOVER_RADIUS = 20;

interface PriceChartProps {
	series: ChartSeries[];
	viewMode: ViewMode;
	scaleMode: ScaleMode;
	/** Series id currently hovered (via chart line or legend chip) */
	hoveredId?: string | null;
	/** Report the series id under the cursor, or null when none is close */
	onHover?: (id: string | null) => void;
}

export function PriceChart({
	series,
	viewMode,
	scaleMode,
	hoveredId = null,
	onHover,
}: PriceChartProps) {
	const containerRef = useRef<HTMLDivElement>(null);
	const { width, height } = useContainerSize(containerRef);
	const [mouseX, setMouseX] = useState<number | null>(null);

	const innerWidth = width - CHART_MARGIN.left - CHART_MARGIN.right;
	const innerHeight = height - CHART_MARGIN.top - CHART_MARGIN.bottom;

	const visibleSeries = useMemo(
		() => series.filter((s) => s.visible),
		[series],
	);

	// Paint the hovered line last so it draws above the dimmed ones.
	const paintOrderedSeries = useMemo(() => {
		if (!hoveredId) return visibleSeries;
		const hovered = visibleSeries.filter((s) => s.id === hoveredId);
		if (hovered.length === 0) return visibleSeries;
		return [...visibleSeries.filter((s) => s.id !== hoveredId), ...hovered];
	}, [visibleSeries, hoveredId]);

	const xScale = useMemo(() => {
		let maxDay: number;
		if (viewMode === "year") {
			maxDay = 366;
		} else if (viewMode === "epoch") {
			maxDay = 1461;
		} else {
			const allDays = visibleSeries.flatMap((s) => s.data.map((d) => d.day));
			maxDay = allDays.length > 0 ? Math.max(...allDays) * 1.02 : 1000;
		}
		return scaleLinear()
			.domain([viewMode === "year" ? 1 : 0, maxDay])
			.range([0, innerWidth]);
	}, [viewMode, innerWidth, visibleSeries]);

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

	/**
	 * Find the visible series whose line passes closest to the cursor.
	 * Math-based hit detection (instead of pointer events on the paths)
	 * because the transparent crosshair overlay sits above the lines,
	 * and it works for touch tracking too.
	 */
	const detectHoveredSeries = useCallback(
		(x: number, y: number) => {
			if (!onHover) return;

			const day = xScale.invert(x);
			let bestId: string | null = null;
			let bestDist = Number.POSITIVE_INFINITY;

			for (const s of visibleSeries) {
				const point = nearestPoint(s.data, day);
				if (!point) continue;

				const val =
					scaleMode === "log"
						? 1 + point.percentReturn / 100
						: point.percentReturn;
				if (scaleMode === "log" && val <= 0) continue;

				const dist = Math.abs(yScale(val) - y);
				if (dist < bestDist) {
					bestDist = dist;
					bestId = s.id;
				}
			}

			onHover(bestDist <= HOVER_RADIUS ? bestId : null);
		},
		[onHover, xScale, yScale, scaleMode, visibleSeries],
	);

	const handleMouseMove = useCallback(
		(e: React.MouseEvent<SVGRectElement>) => {
			const rect = e.currentTarget.getBoundingClientRect();
			const x = e.clientX - rect.left;
			setMouseX(Math.max(0, Math.min(x, innerWidth)));
			detectHoveredSeries(x, e.clientY - rect.top);
		},
		[innerWidth, detectHoveredSeries],
	);

	const handleMouseLeave = useCallback(() => {
		setMouseX(null);
		onHover?.(null);
	}, [onHover]);

	const handleTouchMove = useCallback(
		(e: React.TouchEvent<SVGRectElement>) => {
			const touch = e.touches[0];
			if (!touch) return;
			const rect = e.currentTarget.getBoundingClientRect();
			const x = touch.clientX - rect.left;
			setMouseX(Math.max(0, Math.min(x, innerWidth)));
			detectHoveredSeries(x, touch.clientY - rect.top);
		},
		[innerWidth, detectHoveredSeries],
	);

	return (
		<div ref={containerRef} className="h-[clamp(360px,65svh,900px)] w-full">
			{width > 0 && height > 0 && (
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

						{paintOrderedSeries.map((s) => (
							<ChartLine
								key={s.id}
								series={s}
								xScale={xScale}
								yScale={yScale}
								scaleMode={scaleMode}
								dimmed={hoveredId !== null && s.id !== hoveredId}
								highlighted={s.id === hoveredId}
							/>
						))}

						<ChartCrosshair
							mouseX={mouseX}
							series={series}
							xScale={xScale}
							viewMode={viewMode}
							height={innerHeight}
							width={innerWidth}
							hoveredId={hoveredId}
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
			)}
		</div>
	);
}
