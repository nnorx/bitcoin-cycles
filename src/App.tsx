import { ChartPage } from "./components/ChartPage";
import { ThemeToggle } from "./components/ThemeToggle";

function App() {
	return (
		<div className="flex min-h-screen flex-col bg-background text-foreground">
			<header className="flex items-center justify-between border-border border-b px-6 py-4">
				<h1 className="font-semibold text-lg">Bitcoin Cycles</h1>
				<ThemeToggle />
			</header>
			<main className="flex-1 p-4 md:p-6">
				<ChartPage />
			</main>
			<footer className="border-t py-8">
				<div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
					<div className="flex flex-col items-center justify-center gap-2 text-center text-muted-foreground text-sm">
						<p>
							Built by{" "}
							<a
								href="https://nicknorcross.com"
								target="_blank"
								rel="noopener noreferrer"
								className="font-medium text-foreground underline decoration-muted-foreground/50 underline-offset-4 transition-colors hover:decoration-foreground"
							>
								Nick Norcross
							</a>
						</p>
						<p className="text-muted-foreground/75 text-xs">
							Open source on{" "}
							<a
								href="https://github.com/nnorx/bitcoin-cycles"
								target="_blank"
								rel="noopener noreferrer"
								className="underline decoration-muted-foreground/30 underline-offset-2 transition-colors hover:text-foreground hover:decoration-foreground/50"
							>
								GitHub
							</a>
						</p>
					</div>
				</div>
			</footer>
		</div>
	);
}

export default App;
