import { useEffect, useState } from "react";
import { fetchBitcoinPriceHistory } from "@/lib/bitcoin-api";
import type { DailyPrice } from "@/lib/bitcoin-types";

interface BitcoinDataState {
	data: DailyPrice[] | null;
	loading: boolean;
	error: string | null;
}

export function useBitcoinData() {
	const [state, setState] = useState<BitcoinDataState>({
		data: null,
		loading: true,
		error: null,
	});

	const fetchData = () => {
		setState({ data: null, loading: true, error: null });
		fetchBitcoinPriceHistory()
			.then((data) => setState({ data, loading: false, error: null }))
			.catch((err: unknown) => {
				const message =
					err instanceof Error ? err.message : "Failed to fetch data";
				setState({ data: null, loading: false, error: message });
			});
	};

	useEffect(fetchData, []);

	return { ...state, retry: fetchData };
}
