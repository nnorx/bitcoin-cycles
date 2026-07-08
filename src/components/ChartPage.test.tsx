import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { DailyPrice } from "@/lib/bitcoin-types";

// Render immediately with loaded data — the URL wiring is what we're exercising.
const MOCK_DATA: DailyPrice[] = [
	{ date: new Date("2017-01-01T00:00:00Z"), price: 1000 },
	{ date: new Date("2017-06-01T00:00:00Z"), price: 2500 },
	{ date: new Date("2021-01-01T00:00:00Z"), price: 29000 },
	{ date: new Date("2021-06-01T00:00:00Z"), price: 35000 },
];

vi.mock("@/hooks/use-bitcoin-data", () => ({
	useBitcoinData: () => ({
		data: MOCK_DATA,
		loading: false,
		error: null,
		retry: () => {},
	}),
}));

const { ChartPage } = await import("./ChartPage");

describe("ChartPage URL state", () => {
	beforeEach(() => {
		window.history.replaceState(null, "", "/");
	});

	it("writes the selected view and scale to the URL", async () => {
		const user = userEvent.setup();
		render(<ChartPage />);

		// Mount with defaults leaves the URL clean.
		expect(window.location.search).toBe("");

		await user.click(screen.getByRole("button", { name: "Epoch" }));
		expect(window.location.search).toBe("?view=epoch");

		await user.click(screen.getByRole("button", { name: "Linear" }));
		expect(window.location.search).toBe("?view=epoch&scale=linear");
	});

	it("restores a rich state from the URL on mount", () => {
		window.history.replaceState(
			null,
			"",
			"/?scale=linear&series=2017,2021&avg=election,visible",
		);
		render(<ChartPage />);

		// The mount effect re-serializes parsed state; an unchanged URL proves
		// the state was parsed and applied (a failed parse would reset to "").
		expect(window.location.search).toBe(
			"?scale=linear&series=2017,2021&avg=election,visible",
		);
	});
});
