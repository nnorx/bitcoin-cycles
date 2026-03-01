import type { RefObject } from "react";
import { useEffect, useState } from "react";

export function useContainerSize(ref: RefObject<HTMLDivElement | null>) {
	const [size, setSize] = useState({ width: 0, height: 0 });

	useEffect(() => {
		const el = ref.current;
		if (!el) return;

		const observer = new ResizeObserver((entries) => {
			const entry = entries[0];
			if (entry) {
				setSize({
					width: Math.floor(entry.contentRect.width),
					height: Math.floor(entry.contentRect.height),
				});
			}
		});

		observer.observe(el);
		return () => observer.disconnect();
	}, [ref]);

	return size;
}
