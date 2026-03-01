import { type RenderOptions, render } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ReactElement, ReactNode } from "react";

/**
 * Custom render function that wraps components with necessary providers.
 * Extend this as you add more providers (e.g., router, state management).
 */
function AllProviders({ children }: { children: ReactNode }) {
	return <>{children}</>;
}

function customRender(
	ui: ReactElement,
	options?: Omit<RenderOptions, "wrapper">,
) {
	return {
		user: userEvent.setup(),
		...render(ui, { wrapper: AllProviders, ...options }),
	};
}

// Re-export everything from testing-library
export * from "@testing-library/react";

// Override render with custom version
export { customRender as render };
