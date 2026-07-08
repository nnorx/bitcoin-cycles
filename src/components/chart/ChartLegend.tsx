import { Button } from "@/components/ui/button";
import { YEAR_GROUPS } from "@/lib/bitcoin-constants";
import type { ChartSeries, ViewMode } from "@/lib/bitcoin-types";
import { cn } from "@/lib/utils";

interface ChartLegendProps {
	series: ChartSeries[];
	viewMode: ViewMode;
	onToggle: (id: string) => void;
	onShowAll: () => void;
	onHideAll: () => void;
	onGroupSelect?: (groupId: string) => void;
	onToggleAverage?: (avgId: string) => void;
	enabledAverages?: Set<string>;
	showCustomAverage?: boolean;
	onToggleCustomAverage?: () => void;
	/** Series id currently hovered (chip or chart line) — its chip is emphasized */
	hoveredId?: string | null;
	/** Report the series id under the pointer/focus, or null when it leaves */
	onHover?: (id: string | null) => void;
}

/** Shared pill styling for average toggles — visibly bistable via aria-pressed */
const AVG_TOGGLE_CLASS = cn(
	"rounded-md border px-2 py-0.5 text-xs transition-all active:scale-[0.97]",
	"aria-pressed:border-foreground/30 aria-pressed:bg-accent aria-pressed:text-foreground",
	"border-border text-muted-foreground hover:bg-accent hover:text-foreground",
);

export function ChartLegend({
	series,
	viewMode,
	onToggle,
	onShowAll,
	onHideAll,
	onGroupSelect,
	onToggleAverage,
	enabledAverages,
	showCustomAverage,
	onToggleCustomAverage,
	hoveredId = null,
	onHover,
}: ChartLegendProps) {
	const yearSeries = series.filter((s) => !s.dashed);
	const allVisible = yearSeries.every((s) => s.visible);
	const noneVisible = yearSeries.every((s) => !s.visible);
	const isYearView = viewMode === "year";
	const isCycleView = viewMode === "peak-trough" || viewMode === "trough-peak";

	return (
		<div className="flex flex-col gap-2">
			{/* Row 1: Visibility controls + group quick-select */}
			<div className="flex flex-wrap items-center gap-2">
				<Button
					variant="ghost"
					size="sm"
					onClick={onShowAll}
					disabled={allVisible}
					className="h-7 px-2 text-xs"
				>
					All
				</Button>
				<Button
					variant="ghost"
					size="sm"
					onClick={onHideAll}
					disabled={noneVisible}
					className="h-7 px-2 text-xs"
				>
					None
				</Button>
				{isYearView && onGroupSelect && (
					<>
						<span className="text-border">|</span>
						{YEAR_GROUPS.map((group) => (
							<Button
								key={group.id}
								variant="outline"
								size="sm"
								onClick={() => onGroupSelect(group.id)}
								className="h-7 px-2 text-xs active:scale-[0.97]"
							>
								{group.label}
							</Button>
						))}
					</>
				)}
			</div>

			{/* Row 2: Average toggles */}
			{(isYearView || isCycleView) && (
				<div className="flex flex-wrap items-center gap-1">
					{isYearView &&
						onToggleAverage &&
						YEAR_GROUPS.map((group) => {
							const avgId = `avg-${group.id}`;
							return (
								<button
									key={avgId}
									type="button"
									aria-pressed={enabledAverages?.has(avgId) ?? false}
									onClick={() => onToggleAverage(avgId)}
									className={AVG_TOGGLE_CLASS}
								>
									Avg: {group.label}
								</button>
							);
						})}
					{onToggleCustomAverage && (
						<button
							type="button"
							aria-pressed={showCustomAverage ?? false}
							onClick={onToggleCustomAverage}
							className={AVG_TOGGLE_CLASS}
						>
							Avg: Visible
						</button>
					)}
				</div>
			)}

			{/* Row 3: Individual series toggles */}
			<div className="flex flex-wrap gap-1">
				{series.map((s) => (
					<button
						key={s.id}
						type="button"
						aria-pressed={s.visible}
						onClick={() => onToggle(s.id)}
						onMouseEnter={() => onHover?.(s.id)}
						onMouseLeave={() => onHover?.(null)}
						onFocus={() => onHover?.(s.id)}
						onBlur={() => onHover?.(null)}
						className={cn(
							"flex items-center gap-1.5 rounded-md border px-2 py-1 text-xs transition-all active:scale-[0.97]",
							s.visible
								? "border-border bg-accent/50 text-foreground hover:bg-accent"
								: "border-border/60 text-muted-foreground hover:bg-accent/40 hover:text-foreground",
							hoveredId === s.id && "ring-2 ring-ring/60",
						)}
					>
						{s.dashed ? (
							<span
								className="inline-block h-0 w-3 border-t-2 border-dashed"
								style={{
									borderColor: s.visible ? s.color : "var(--muted-foreground)",
								}}
							/>
						) : (
							<span
								className="inline-block h-2.5 w-2.5 rounded-full transition-colors"
								style={{
									backgroundColor: s.visible
										? s.color
										: "var(--muted-foreground)",
								}}
							/>
						)}
						{s.label}
					</button>
				))}
			</div>
		</div>
	);
}
