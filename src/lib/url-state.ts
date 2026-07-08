import { YEAR_GROUPS } from "./bitcoin-constants";
import type { ScaleMode, ViewMode } from "./bitcoin-types";

/**
 * The full chart state that survives a reload and can be shared via a link.
 * All fields are data-independent so the URL can be parsed before price data
 * loads and applied without waiting on it.
 */
export interface ChartUrlState {
	viewMode: ViewMode;
	scaleMode: ScaleMode;
	/** `null` = all series visible (the default); otherwise the exact set shown. */
	visibleIds: Set<string> | null;
	/** Enabled group-average ids, e.g. `"avg-election"`. */
	enabledAverages: Set<string>;
	/** Whether the "average of visible series" line is shown. */
	showCustomAverage: boolean;
}

const VIEW_MODES: readonly string[] = [
	"year",
	"epoch",
	"peak-trough",
	"trough-peak",
];
const SCALE_MODES: readonly string[] = ["linear", "log"];

const DEFAULT_VIEW: ViewMode = "year";
const DEFAULT_SCALE: ScaleMode = "log";

const GROUP_IDS = new Set(YEAR_GROUPS.map((g) => g.id));
const CUSTOM_AVG_TOKEN = "visible";
const EMPTY_SERIES_TOKEN = "none";

export const DEFAULT_URL_STATE: ChartUrlState = {
	viewMode: DEFAULT_VIEW,
	scaleMode: DEFAULT_SCALE,
	visibleIds: null,
	enabledAverages: new Set(),
	showCustomAverage: false,
};

/** Parse chart state from a URL search string (e.g. `window.location.search`). */
export function parseUrlState(search: string): ChartUrlState {
	const params = new URLSearchParams(search);

	const viewParam = params.get("view");
	const viewMode: ViewMode = VIEW_MODES.includes(viewParam ?? "")
		? (viewParam as ViewMode)
		: DEFAULT_VIEW;

	const scaleParam = params.get("scale");
	const scaleMode: ScaleMode = SCALE_MODES.includes(scaleParam ?? "")
		? (scaleParam as ScaleMode)
		: DEFAULT_SCALE;

	let visibleIds: Set<string> | null = null;
	const seriesParam = params.get("series");
	if (seriesParam === EMPTY_SERIES_TOKEN) {
		visibleIds = new Set();
	} else if (seriesParam) {
		visibleIds = new Set(
			seriesParam
				.split(",")
				.map((s) => s.trim())
				.filter(Boolean),
		);
	}

	const enabledAverages = new Set<string>();
	let showCustomAverage = false;
	const avgParam = params.get("avg");
	if (avgParam) {
		for (const token of avgParam.split(",").map((s) => s.trim())) {
			if (token === CUSTOM_AVG_TOKEN) {
				showCustomAverage = true;
			} else if (GROUP_IDS.has(token)) {
				enabledAverages.add(`avg-${token}`);
			}
		}
	}

	return {
		viewMode,
		scaleMode,
		visibleIds,
		enabledAverages,
		showCustomAverage,
	};
}

/**
 * Serialize chart state to a URL search string (including the leading `?`),
 * or `""` when everything is at its default so the URL stays clean.
 */
export function serializeUrlState(state: ChartUrlState): string {
	const parts: string[] = [];

	if (state.viewMode !== DEFAULT_VIEW) parts.push(`view=${state.viewMode}`);
	if (state.scaleMode !== DEFAULT_SCALE) parts.push(`scale=${state.scaleMode}`);

	if (state.visibleIds !== null) {
		const value =
			state.visibleIds.size === 0
				? EMPTY_SERIES_TOKEN
				: [...state.visibleIds].sort().join(",");
		parts.push(`series=${value}`);
	}

	// Emit group averages in a stable order, then the custom ("visible") one.
	const avgTokens: string[] = [];
	for (const group of YEAR_GROUPS) {
		if (state.enabledAverages.has(`avg-${group.id}`)) avgTokens.push(group.id);
	}
	if (state.showCustomAverage) avgTokens.push(CUSTOM_AVG_TOKEN);
	if (avgTokens.length > 0) parts.push(`avg=${avgTokens.join(",")}`);

	return parts.length > 0 ? `?${parts.join("&")}` : "";
}
