import { bisector } from "d3-array";
import { format as d3Format } from "d3-format";
import type { ScaleLinear } from "d3-scale";
import { useMemo } from "react";
import type { ChartSeries, SeriesPoint, ViewMode } from "@/lib/bitcoin-types";

interface ChartCrosshairProps {
	mouseX: number | null;
	series: ChartSeries[];
	xScale: ScaleLinear<number, number>;
	viewMode: ViewMode;
	height: number;
	width: number;
}

const pointBisector = bisector<SeriesPoint, number>((d) => d.day).left;
const formatPct = d3Format("+,.1f");

export function ChartCrosshair({
	mouseX,
	series,
	xScale,
	viewMode,
	height,
	width,
}: ChartCrosshairProps) {
	const tooltipData = useMemo(() => {
		if (mouseX == null) return null;

		const day = xScale.invert(mouseX);
		const items: Array<{ label: string; color: string; value: string }> = [];

		for (const s of series) {
			if (!s.visible || s.data.length === 0) continue;

			const idx = pointBisector(s.data, day);
			const d0 = s.data[idx - 1];
			const d1 = s.data[idx];

			let nearest: SeriesPoint | undefined;
			if (d0 && d1) {
				nearest = day - d0.day < d1.day - day ? d0 : d1;
			} else {
				nearest = d0 ?? d1;
			}

			if (nearest) {
				items.push({
					label: s.label,
					color: s.color,
					value: `${formatPct(nearest.percentReturn)}%`,
				});
			}
		}

		return { day: Math.round(day), items };
	}, [mouseX, series, xScale]);

	if (mouseX == null || !tooltipData || tooltipData.items.length === 0)
		return null;

	const tooltipMaxWidth = viewMode === "year" ? 140 : 220;
	const flipThreshold = width - tooltipMaxWidth - 20;
	const tooltipX =
		mouseX > flipThreshold ? mouseX - tooltipMaxWidth - 12 : mouseX + 12;

	return (
		<g>
			{/* Vertical crosshair line */}
			<line
				x1={mouseX}
				x2={mouseX}
				y1={0}
				y2={height}
				stroke="var(--muted-foreground)"
				strokeWidth={0.5}
				strokeDasharray="3 3"
				pointerEvents="none"
			/>

			{/* Tooltip */}
			<foreignObject
				x={tooltipX}
				y={8}
				width={tooltipMaxWidth}
				height={height - 16}
				pointerEvents="none"
				style={{ overflow: "visible" }}
			>
				<div
					style={{
						maxWidth: tooltipMaxWidth,
						width: "max-content",
						background: "var(--popover)",
						color: "var(--popover-foreground)",
						border: "1px solid var(--border)",
						borderRadius: "6px",
						padding: "6px 8px",
						fontSize: "11px",
						lineHeight: "1.5",
					}}
				>
					<div style={{ fontWeight: 600, marginBottom: 2 }}>
						Day {tooltipData.day}
					</div>
					{tooltipData.items.map((item) => (
						<div
							key={item.label}
							style={{ display: "flex", alignItems: "center", gap: 4 }}
						>
							<span
								style={{
									width: 8,
									height: 8,
									borderRadius: "50%",
									backgroundColor: item.color,
									flexShrink: 0,
								}}
							/>
							<span
								style={{
									flex: 1,
									overflow: "hidden",
									textOverflow: "ellipsis",
									whiteSpace: "nowrap",
								}}
							>
								{item.label}
							</span>
							<span
								style={{
									flexShrink: 0,
									fontVariantNumeric: "tabular-nums",
								}}
							>
								{item.value}
							</span>
						</div>
					))}
				</div>
			</foreignObject>
		</g>
	);
}
