import { useCallback, useEffect, useMemo, useState } from "react";
import { useBitcoinData } from "@/hooks/use-bitcoin-data";
import { useIsDark } from "@/hooks/use-is-dark";
import {
	AVG_COLORS_DARK,
	AVG_COLORS_LIGHT,
	YEAR_GROUPS,
} from "@/lib/bitcoin-constants";
import {
	buildAverageSeries,
	buildEpochSeries,
	buildPeakTroughSeries,
	buildTroughPeakSeries,
	buildYearSeries,
} from "@/lib/bitcoin-transforms";
import type { ScaleMode, ViewMode } from "@/lib/bitcoin-types";
import { parseUrlState, serializeUrlState } from "@/lib/url-state";
import { ChartControls } from "./chart/ChartControls";
import { ChartLegend } from "./chart/ChartLegend";
import { PriceChart } from "./chart/PriceChart";

export function ChartPage() {
	const { data, loading, error, retry } = useBitcoinData();
	const initialState = useMemo(() => parseUrlState(window.location.search), []);
	const [viewMode, setViewMode] = useState<ViewMode>(initialState.viewMode);
	const [scaleMode, setScaleMode] = useState<ScaleMode>(initialState.scaleMode);
	const [visibleIds, setVisibleIds] = useState<Set<string> | null>(
		initialState.visibleIds,
	);
	const [enabledAverages, setEnabledAverages] = useState<Set<string>>(
		initialState.enabledAverages,
	);
	const [showCustomAverage, setShowCustomAverage] = useState(
		initialState.showCustomAverage,
	);
	const [hoveredId, setHoveredId] = useState<string | null>(null);
	const isDark = useIsDark();

	// Keep the URL in sync so the current view is shareable and survives reloads.
	useEffect(() => {
		const search = serializeUrlState({
			viewMode,
			scaleMode,
			visibleIds,
			enabledAverages,
			showCustomAverage,
		});
		const url = `${window.location.pathname}${search}${window.location.hash}`;
		window.history.replaceState(null, "", url);
	}, [viewMode, scaleMode, visibleIds, enabledAverages, showCustomAverage]);

	const allSeries = useMemo(() => {
		if (!data) return [];
		switch (viewMode) {
			case "year":
				return buildYearSeries(data, isDark);
			case "epoch":
				return buildEpochSeries(data, isDark);
			case "peak-trough":
				return buildPeakTroughSeries(data, isDark);
			case "trough-peak":
				return buildTroughPeakSeries(data, isDark);
		}
	}, [data, viewMode, isDark]);

	const series = useMemo(
		() =>
			allSeries.map((s) => ({
				...s,
				visible: visibleIds ? visibleIds.has(s.id) : true,
			})),
		[allSeries, visibleIds],
	);

	const isCycleView = viewMode === "peak-trough" || viewMode === "trough-peak";

	const averageSeries = useMemo(() => {
		if (viewMode === "epoch") return [];

		const avgColorMap = isDark ? AVG_COLORS_DARK : AVG_COLORS_LIGHT;
		const avgs = [];

		if (viewMode === "year") {
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
		}

		if (showCustomAverage) {
			const visible = series.filter((s) => s.visible && !s.dashed);
			if (visible.length > 0) {
				const countLabel = isCycleView
					? `${visible.length} cycles`
					: `${visible.length}yr`;
				avgs.push(
					buildAverageSeries(
						visible,
						"avg-custom",
						`Avg: Custom (${countLabel})`,
						avgColorMap.custom ?? "oklch(0.5 0 0)",
					),
				);
			}
		}

		return avgs;
	}, [
		viewMode,
		allSeries,
		series,
		enabledAverages,
		showCustomAverage,
		isDark,
		isCycleView,
	]);

	const combinedSeries = useMemo(
		() => [...series, ...averageSeries],
		[series, averageSeries],
	);

	const handleViewModeChange = useCallback((mode: ViewMode) => {
		setViewMode(mode);
		setVisibleIds(null);
		setEnabledAverages(new Set());
		setShowCustomAverage(false);
		setHoveredId(null);
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
			setVisibleIds((prev) => {
				const allIds = allSeries.map((s) => s.id);
				const next = new Set(prev ?? allIds);
				if (next.has(id)) {
					next.delete(id);
				} else {
					next.add(id);
				}
				// Collapse back to the "all visible" default for a clean URL.
				return next.size === allIds.length && allIds.every((x) => next.has(x))
					? null
					: next;
			});
		},
		[allSeries, handleToggleAverage],
	);

	const handleShowAll = useCallback(() => {
		setVisibleIds(null);
	}, []);

	const handleHideAll = useCallback(() => {
		setVisibleIds(new Set());
	}, []);

	const handleGroupSelect = useCallback((groupId: string) => {
		const group = YEAR_GROUPS.find((g) => g.id === groupId);
		if (!group) return;
		setVisibleIds(new Set(group.years));
	}, []);

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
				hoveredId={hoveredId}
				onHover={setHoveredId}
			/>
			<ChartLegend
				series={combinedSeries}
				viewMode={viewMode}
				hoveredId={hoveredId}
				onHover={setHoveredId}
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
