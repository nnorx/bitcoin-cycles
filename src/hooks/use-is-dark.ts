import { useSyncExternalStore } from "react";

function subscribe(callback: () => void) {
	const observer = new MutationObserver(callback);
	observer.observe(document.documentElement, {
		attributes: true,
		attributeFilter: ["class"],
	});
	return () => observer.disconnect();
}

function getSnapshot() {
	return document.documentElement.classList.contains("dark");
}

/**
 * Reactive dark-mode flag driven by the `dark` class on <html>.
 *
 * Backed by a MutationObserver so every consumer updates the instant the
 * theme changes — whether from the ThemeToggle or an OS change in "system"
 * mode — instead of waiting for an unrelated re-render.
 */
export function useIsDark(): boolean {
	return useSyncExternalStore(subscribe, getSnapshot);
}
