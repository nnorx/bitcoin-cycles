import { YEAR_GROUPS } from "@/lib/bitcoin-constants";
import type { ChartSeries, ViewMode } from "@/lib/bitcoin-types";

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
}

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
				<button
					type="button"
					onClick={onShowAll}
					disabled={allVisible}
					className="rounded px-2 py-0.5 text-muted-foreground text-xs hover:text-foreground disabled:opacity-40"
				>
					All
				</button>
				<button
					type="button"
					onClick={onHideAll}
					disabled={noneVisible}
					className="rounded px-2 py-0.5 text-muted-foreground text-xs hover:text-foreground disabled:opacity-40"
				>
					None
				</button>
				{isYearView && onGroupSelect && (
					<>
						<span className="text-border">|</span>
						{YEAR_GROUPS.map((group) => (
							<button
								key={group.id}
								type="button"
								onClick={() => onGroupSelect(group.id)}
								className="rounded border border-border px-2 py-0.5 text-muted-foreground text-xs hover:bg-accent hover:text-foreground"
							>
								{group.label}
							</button>
						))}
					</>
				)}
			</div>

			{/* Row 2: Average toggles (year view only) */}
			{isYearView && onToggleAverage && (
				<div className="flex flex-wrap items-center gap-1">
					{YEAR_GROUPS.map((group) => {
						const avgId = `avg-${group.id}`;
						const isActive = enabledAverages?.has(avgId) ?? false;
						return (
							<button
								key={avgId}
								type="button"
								onClick={() => onToggleAverage(avgId)}
								className={`rounded-md border px-2 py-0.5 text-xs transition-colors ${
									isActive
										? "border-foreground/30 bg-accent text-foreground"
										: "border-border text-muted-foreground hover:bg-accent hover:text-foreground"
								}`}
							>
								Avg: {group.label}
							</button>
						);
					})}
					{onToggleCustomAverage && (
						<button
							type="button"
							onClick={onToggleCustomAverage}
							className={`rounded-md border px-2 py-0.5 text-xs transition-colors ${
								showCustomAverage
									? "border-foreground/30 bg-accent text-foreground"
									: "border-border text-muted-foreground hover:bg-accent hover:text-foreground"
							}`}
						>
							Avg: Visible
						</button>
					)}
				</div>
			)}

			{/* Cycle view: custom average toggle only */}
			{isCycleView && onToggleCustomAverage && (
				<div className="flex flex-wrap items-center gap-1">
					<button
						type="button"
						onClick={onToggleCustomAverage}
						className={`rounded-md border px-2 py-0.5 text-xs transition-colors ${
							showCustomAverage
								? "border-foreground/30 bg-accent text-foreground"
								: "border-border text-muted-foreground hover:bg-accent hover:text-foreground"
						}`}
					>
						Avg: Visible
					</button>
				</div>
			)}

			{/* Row 3: Individual series toggles */}
			<div className="flex flex-wrap gap-1">
				{series.map((s) => (
					<button
						key={s.id}
						type="button"
						onClick={() => onToggle(s.id)}
						className="flex items-center gap-1.5 rounded-md border border-border px-2 py-1 text-xs transition-opacity hover:bg-accent"
						style={{ opacity: s.visible ? 1 : 0.4 }}
					>
						{s.dashed ? (
							<span
								className="inline-block h-0 w-3 border-t-2 border-dashed"
								style={{ borderColor: s.color }}
							/>
						) : (
							<span
								className="inline-block h-2.5 w-2.5 rounded-full"
								style={{ backgroundColor: s.color }}
							/>
						)}
						{s.label}
					</button>
				))}
			</div>
		</div>
	);
}
