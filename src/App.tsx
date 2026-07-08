import { ChartPage } from "./components/ChartPage";
import { ShareButton } from "./components/ShareButton";
import { ThemeToggle } from "./components/ThemeToggle";

/** Shared horizontal rhythm for header, main, and footer */
const CONTAINER = "mx-auto w-full max-w-(--breakpoint-2xl) px-4 md:px-6";

const FOOTER_LINK =
	"text-foreground underline decoration-muted-foreground/40 underline-offset-4 transition-colors hover:decoration-foreground";

function App() {
	return (
		<div className="flex min-h-screen flex-col bg-background text-foreground">
			<header className="border-border border-b">
				<div className={`${CONTAINER} flex items-center justify-between py-4`}>
					<h1 className="font-semibold text-lg">Bitcoin Cycles</h1>
					<div className="flex items-center gap-2">
						<ShareButton />
						<ThemeToggle />
					</div>
				</div>
			</header>
			<main className={`${CONTAINER} flex-1 py-4 md:py-6`}>
				<ChartPage />
			</main>
			<footer className="border-t py-4">
				<div
					className={`${CONTAINER} flex flex-wrap items-center justify-center gap-x-2 gap-y-1 text-center text-muted-foreground text-sm`}
				>
					<p>
						Built by{" "}
						<a
							href="https://nicknorcross.com"
							target="_blank"
							rel="noopener noreferrer"
							className={FOOTER_LINK}
						>
							Nick Norcross
						</a>
					</p>
					<span aria-hidden="true">·</span>
					<p>
						Price data by{" "}
						<a
							href="https://www.coingecko.com"
							target="_blank"
							rel="noopener noreferrer"
							className={FOOTER_LINK}
						>
							CoinGecko
						</a>
					</p>
					<span aria-hidden="true">·</span>
					<p>
						Open source on{" "}
						<a
							href="https://github.com/nnorx/bitcoin-cycles"
							target="_blank"
							rel="noopener noreferrer"
							className={FOOTER_LINK}
						>
							GitHub
						</a>
					</p>
				</div>
			</footer>
		</div>
	);
}

export default App;
