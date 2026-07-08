import { Check, Link2 } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

/**
 * Copies a link to the current view. The chart keeps `window.location`
 * in sync, so `href` already encodes the view, scale, selection, and averages.
 */
export function ShareButton() {
	const [copied, setCopied] = useState(false);

	useEffect(() => {
		if (!copied) return;
		const timer = setTimeout(() => setCopied(false), 1500);
		return () => clearTimeout(timer);
	}, [copied]);

	const handleCopy = useCallback(async () => {
		try {
			await navigator.clipboard.writeText(window.location.href);
			setCopied(true);
		} catch {
			// Clipboard unavailable (e.g. insecure context) — no-op.
		}
	}, []);

	return (
		<Button
			variant="outline"
			size="sm"
			onClick={handleCopy}
			aria-label="Copy a shareable link to this view"
		>
			{copied ? <Check /> : <Link2 />}
			{copied ? "Copied" : "Share"}
		</Button>
	);
}
