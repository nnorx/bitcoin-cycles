import { useCallback, useMemo, useState } from "react";
import { useBitcoinData } from "@/hooks/use-bitcoin-data";
import {
	AVG_COLORS_DARK,
	AVG_COLORS_LIGHT,
	YEAR_GROUPS,
} from "@/lib/bitcoin-constants";
import {
	buildAverageSeries,
	buildEpochSeries,
	buildYearSeries,
} from "@/lib/bitcoin-transforms";
import type { ScaleMode, ViewMode } from "@/lib/bitcoin-types";
import { ChartControls } from "./chart/ChartControls";
import { ChartLegend } from "./chart/ChartLegend";
import { PriceChart } from "./chart/PriceChart";

function useIsDark() {
	const [isDark, setIsDark] = useState(() =>
		document.documentElement.classList.contains("dark"),
	);

	// Re-check on render since theme can change
	const currentIsDark = document.documentElement.classList.contains("dark");
	if (currentIsDark !== isDark) {
		setIsDark(currentIsDark);
	}

	return isDark;
}

export function ChartPage() {
	const { data, loading, error, retry } = useBitcoinData();
	const [viewMode, setViewMode] = useState<ViewMode>("year");
	const [scaleMode, setScaleMode] = useState<ScaleMode>("log");
	const [visibilityMap, setVisibilityMap] = useState<Map<string, boolean>>(
		() => new Map(),
	);
	const [enabledAverages, setEnabledAverages] = useState<Set<string>>(
		() => new Set(),
	);
	const [showCustomAverage, setShowCustomAverage] = useState(false);
	const isDark = useIsDark();

	const allSeries = useMemo(() => {
		if (!data) return [];
		return viewMode === "year"
			? buildYearSeries(data, isDark)
			: buildEpochSeries(data, isDark);
	}, [data, viewMode, isDark]);

	const series = useMemo(
		() =>
			allSeries.map((s) => ({
				...s,
				visible: visibilityMap.get(s.id) ?? s.visible,
			})),
		[allSeries, visibilityMap],
	);

	const averageSeries = useMemo(() => {
		if (viewMode !== "year") return [];

		const avgColorMap = isDark ? AVG_COLORS_DARK : AVG_COLORS_LIGHT;
		const avgs = [];

		for (const group of YEAR_GROUPS) {
			const avgId = `avg-${group.id}`;
			if (!enabledAverages.has(avgId)) continue;

			const groupYearSeries = allSeries.filter((s) =>
				group.years.includes(s.id),
			);
			if (groupYearSeries.length === 0) continue;

			avgs.push(
				buildAverageSeries(
					groupYearSeries,
					avgId,
					`Avg: ${group.label}`,
					avgColorMap[group.id] ?? "oklch(0.5 0 0)",
				),
			);
		}

		if (showCustomAverage) {
			const visibleYears = series.filter((s) => s.visible && !s.dashed);
			if (visibleYears.length > 0) {
				avgs.push(
					buildAverageSeries(
						visibleYears,
						"avg-custom",
						`Avg: Custom (${visibleYears.length}yr)`,
						avgColorMap.custom ?? "oklch(0.5 0 0)",
					),
				);
			}
		}

		return avgs;
	}, [viewMode, allSeries, series, enabledAverages, showCustomAverage, isDark]);

	const combinedSeries = useMemo(
		() => [...series, ...averageSeries],
		[series, averageSeries],
	);

	const handleViewModeChange = useCallback((mode: ViewMode) => {
		setViewMode(mode);
		setVisibilityMap(new Map());
		setEnabledAverages(new Set());
		setShowCustomAverage(false);
	}, []);

	const handleToggleAverage = useCallback((avgId: string) => {
		setEnabledAverages((prev) => {
			const next = new Set(prev);
			if (next.has(avgId)) {
				next.delete(avgId);
			} else {
				next.add(avgId);
			}
			return next;
		});
	}, []);

	const handleToggle = useCallback(
		(id: string) => {
			if (id === "avg-custom") {
				setShowCustomAverage((prev) => !prev);
				return;
			}
			if (id.startsWith("avg-")) {
				handleToggleAverage(id);
				return;
			}
			setVisibilityMap((prev) => {
				const next = new Map(prev);
				const currentlyVisible = next.get(id) ?? true;
				next.set(id, !currentlyVisible);
				return next;
			});
		},
		[handleToggleAverage],
	);

	const handleShowAll = useCallback(() => {
		setVisibilityMap((prev) => {
			const next = new Map(prev);
			for (const s of allSeries) {
				next.set(s.id, true);
			}
			return next;
		});
	}, [allSeries]);

	const handleHideAll = useCallback(() => {
		setVisibilityMap((prev) => {
			const next = new Map(prev);
			for (const s of allSeries) {
				next.set(s.id, false);
			}
			return next;
		});
	}, [allSeries]);

	const handleGroupSelect = useCallback(
		(groupId: string) => {
			const group = YEAR_GROUPS.find((g) => g.id === groupId);
			if (!group) return;
			setVisibilityMap(() => {
				const next = new Map<string, boolean>();
				for (const s of allSeries) {
					next.set(s.id, group.years.includes(s.id));
				}
				return next;
			});
		},
		[allSeries],
	);

	if (loading) {
		return (
			<div className="flex flex-1 items-center justify-center">
				<p className="text-muted-foreground">Loading Bitcoin price data...</p>
			</div>
		);
	}

	if (error) {
		return (
			<div className="flex flex-1 flex-col items-center justify-center gap-3">
				<p className="text-destructive">{error}</p>
				<button
					type="button"
					onClick={retry}
					className="rounded-md bg-primary px-4 py-2 text-primary-foreground text-sm hover:opacity-90"
				>
					Retry
				</button>
			</div>
		);
	}

	return (
		<div className="flex flex-col gap-4">
			<ChartControls
				viewMode={viewMode}
				scaleMode={scaleMode}
				onViewModeChange={handleViewModeChange}
				onScaleModeChange={setScaleMode}
			/>
			<PriceChart
				series={combinedSeries}
				viewMode={viewMode}
				scaleMode={scaleMode}
			/>
			<ChartLegend
				series={combinedSeries}
				viewMode={viewMode}
				onToggle={handleToggle}
				onShowAll={handleShowAll}
				onHideAll={handleHideAll}
				onGroupSelect={handleGroupSelect}
				onToggleAverage={handleToggleAverage}
				enabledAverages={enabledAverages}
				showCustomAverage={showCustomAverage}
				onToggleCustomAverage={() => setShowCustomAverage((p) => !p)}
			/>
		</div>
	);
}
