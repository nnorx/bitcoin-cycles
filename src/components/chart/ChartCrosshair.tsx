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
const formatPriceLarge = d3Format("$,.0f");
const formatPriceSmall = d3Format("$,.4f");

/** Sub-$1 early history needs decimals; everything else reads fine as whole dollars. */
function formatPrice(price: number): string {
	return price >= 1 ? formatPriceLarge(price) : formatPriceSmall(price);
}

const MONTHS = [
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

/** Map a day-of-year (1–366) to a calendar label like "Mar 14" (non-leap reference). */
function dayOfYearLabel(day: number): string {
	const clamped = Math.max(1, Math.min(365, Math.round(day)));
	const d = new Date(Date.UTC(2001, 0, clamped));
	return `${MONTHS[d.getUTCMonth()] ?? ""} ${d.getUTCDate()}`;
}

interface TooltipItem {
	label: string;
	color: string;
	percent: number;
	price: number | undefined;
}

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
		const items: TooltipItem[] = [];

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
					percent: nearest.percentReturn,
					price: nearest.price,
				});
			}
		}

		// Live leaderboard: highest % return first.
		items.sort((a, b) => b.percent - a.percent);

		return { day: Math.round(day), items };
	}, [mouseX, series, xScale]);

	if (mouseX == null || !tooltipData || tooltipData.items.length === 0)
		return null;

	const headerLabel =
		viewMode === "year"
			? dayOfYearLabel(tooltipData.day)
			: `Day ${tooltipData.day}`;

	const tooltipMaxWidth = viewMode === "year" ? 210 : 260;
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
					<div style={{ fontWeight: 600, marginBottom: 2 }}>{headerLabel}</div>
					{tooltipData.items.map((item) => (
						<div
							key={item.label}
							style={{ display: "flex", alignItems: "center", gap: 6 }}
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
								{formatPct(item.percent)}%
							</span>
							{item.price !== undefined && (
								<span
									style={{
										flexShrink: 0,
										color: "var(--muted-foreground)",
										fontVariantNumeric: "tabular-nums",
									}}
								>
									{formatPrice(item.price)}
								</span>
							)}
						</div>
					))}
				</div>
			</foreignObject>
		</g>
	);
}
