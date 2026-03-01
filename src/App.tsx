import { ThemeToggle } from "./components/ThemeToggle";

function App() {
	return (
		<div className="flex min-h-screen flex-col bg-background text-foreground">
			<header className="flex items-center justify-between border-border border-b px-6 py-4">
				<h1 className="font-semibold text-lg">Frontend Template</h1>
				<ThemeToggle />
			</header>
			<main className="flex flex-1 items-center justify-center p-6">
				<div className="fade-in slide-in-from-bottom-4 animate-in text-center duration-500">
					<h2 className="font-bold text-4xl">Hello World</h2>
					<p className="mt-2 text-muted-foreground">
						Edit{" "}
						<code className="rounded bg-muted px-1.5 py-0.5 text-sm">
							src/App.tsx
						</code>{" "}
						to get started
					</p>
				</div>
			</main>
		</div>
	);
}

export default App;
