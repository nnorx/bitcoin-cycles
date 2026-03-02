import type { ScaleMode, ViewMode } from "@/lib/bitcoin-types";

interface ChartControlsProps {
	viewMode: ViewMode;
	scaleMode: ScaleMode;
	onViewModeChange: (mode: ViewMode) => void;
	onScaleModeChange: (mode: ScaleMode) => void;
}

function ToggleGroup<T extends string>({
	value,
	options,
	onChange,
}: {
	value: T;
	options: Array<{ value: T; label: string }>;
	onChange: (value: T) => void;
}) {
	return (
		<div className="inline-flex rounded-md border border-border">
			{options.map((opt) => (
				<button
					key={opt.value}
					type="button"
					onClick={() => onChange(opt.value)}
					className={`px-3 py-1.5 font-medium text-xs transition-colors ${
						value === opt.value
							? "bg-primary text-primary-foreground"
							: "text-muted-foreground hover:bg-accent hover:text-foreground"
					} ${opt.value === options[0]?.value ? "rounded-l-md" : ""} ${opt.value === options[options.length - 1]?.value ? "rounded-r-md" : ""}`}
				>
					{opt.label}
				</button>
			))}
		</div>
	);
}

type TopLevel = "year" | "epoch" | "cycle";

export function ChartControls({
	viewMode,
	scaleMode,
	onViewModeChange,
	onScaleModeChange,
}: ChartControlsProps) {
	const isCycleView = viewMode === "peak-trough" || viewMode === "trough-peak";
	const topLevel: TopLevel = isCycleView ? "cycle" : viewMode;

	const handleTopLevelChange = (value: TopLevel) => {
		if (value === "cycle") {
			if (!isCycleView) onViewModeChange("peak-trough");
		} else {
			onViewModeChange(value);
		}
	};

	return (
		<div className="flex flex-wrap items-center gap-3">
			<ToggleGroup
				value={topLevel}
				options={[
					{ value: "year" as const, label: "Year" },
					{ value: "epoch" as const, label: "Epoch" },
					{ value: "cycle" as const, label: "Cycle" },
				]}
				onChange={handleTopLevelChange}
			/>
			{isCycleView && (
				<ToggleGroup
					value={viewMode}
					options={[
						{ value: "peak-trough" as const, label: "Peak \u2192 Bottom" },
						{ value: "trough-peak" as const, label: "Bottom \u2192 Peak" },
					]}
					onChange={onViewModeChange}
				/>
			)}
			<ToggleGroup
				value={scaleMode}
				options={[
					{ value: "linear" as const, label: "Linear" },
					{ value: "log" as const, label: "Log" },
				]}
				onChange={onScaleModeChange}
			/>
		</div>
	);
}
