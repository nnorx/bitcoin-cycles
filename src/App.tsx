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
		</div>
	);
}

export default App;
