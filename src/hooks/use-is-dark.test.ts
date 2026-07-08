import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import { useIsDark } from "./use-is-dark";

describe("useIsDark", () => {
	// Reset before each test — when no hook is mounted — so toggling the class
	// never fires an observer on a live component outside of act().
	beforeEach(() => {
		document.documentElement.classList.remove("dark");
	});

	it("reflects the initial dark class on mount", () => {
		document.documentElement.classList.add("dark");
		const { result } = renderHook(() => useIsDark());
		expect(result.current).toBe(true);
	});

	it("updates when the dark class is toggled after mount", async () => {
		document.documentElement.classList.remove("dark");
		const { result } = renderHook(() => useIsDark());
		expect(result.current).toBe(false);

		await act(async () => {
			document.documentElement.classList.add("dark");
			// Let the MutationObserver callback (a microtask) deliver and the
			// resulting re-render settle inside act.
			await new Promise((resolve) => setTimeout(resolve, 0));
		});

		expect(result.current).toBe(true);
	});
});
