import { bisector } from "d3-array";
import type { SeriesPoint } from "./bitcoin-types";

const pointBisector = bisector<SeriesPoint, number>((d) => d.day).left;

/**
 * Find the point in `data` (sorted by day) nearest to a fractional `day`.
 * Used by the crosshair tooltip and hover-highlight hit detection.
 */
export function nearestPoint(
	data: SeriesPoint[],
	day: number,
): SeriesPoint | undefined {
	const idx = pointBisector(data, day);
	const d0 = data[idx - 1];
	const d1 = data[idx];
	if (d0 && d1) {
		return day - d0.day < d1.day - day ? d0 : d1;
	}
	return d0 ?? d1;
}
