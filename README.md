# Frontend Template

A minimal client application template.

## Stack

- **React 19** with [React Compiler](https://react.dev/learn/react-compiler) for automatic memoization
- **TypeScript** with strict mode
- **Vite** (rolldown-vite) for fast builds
- **Tailwind CSS v4** with CSS variables for theming
- **Biome** for linting and formatting
- **Knip** for detecting unused code and dependencies
- **Vitest** + **React Testing Library** for testing
- **tw-animate-css** for animations

## Getting Started

```bash
pnpm install
pnpm dev
```

## Scripts

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start development server |
| `pnpm build` | Type-check and build for production |
| `pnpm preview` | Preview production build |
| `pnpm lint` | Check for linting errors |
| `pnpm format` | Auto-fix linting errors and format code |
| `pnpm type-check` | Run TypeScript type checking |
| `pnpm test` | Run tests once |
| `pnpm test:watch` | Run tests in watch mode |
| `pnpm test:coverage` | Run tests with coverage report |
| `pnpm knip` | Find unused code and dependencies |

## Project Structure

```
src/
├── components/           # Reusable UI components
│   ├── ui/               # Base primitives (Button, DropdownMenu, etc.)
│   ├── ThemeToggle.tsx   # Light/dark/system theme switcher
│   └── ErrorBoundary.tsx # Global error handling
├── features/             # Feature-specific components
├── hooks/                # Custom React hooks
├── lib/                  # Utilities and helpers
│   ├── utils.ts          # cn() utility for Tailwind class merging
│   └── theme.ts          # Theme management (get/set/toggle)
├── routes/               # Route components (if using router)
├── test/                 # Test utilities and setup
│   ├── setup.ts          # Vitest setup with jest-dom matchers
│   └── test-utils.tsx    # Custom render with providers
├── types/                # Shared TypeScript types
├── App.tsx               # Root component
├── main.tsx              # Entry point
└── styles.css            # Global styles and Tailwind config
```

## Path Aliases

Use `@/` to import from the `src` directory:

```tsx
import { cn } from "@/lib/utils";
```

## UI Components

Components in `src/components/ui/` follow the [shadcn/ui](https://ui.shadcn.com/) pattern:

- Built on [Radix UI](https://www.radix-ui.com/) primitives for accessibility
- Styled with Tailwind CSS and [class-variance-authority](https://cva.style/docs) for variants
- Copy-paste friendly—you own the code

```tsx
import { Button } from "@/components/ui/button";

<Button variant="outline" size="sm">Click me</Button>
```

## Theming

CSS variables are configured in `src/styles.css` for light and dark modes. Theme management is handled by `src/lib/theme.ts`:

- `initTheme()` — Sets initial theme before React renders (no flash)
- `getTheme()` / `setTheme(theme)` — Read/write theme preference
- `toggleTheme()` — Quick toggle between light and dark

The `<ThemeToggle />` component provides a dropdown to switch between light, dark, and system modes.

## Testing

Tests use [Vitest](https://vitest.dev/) with [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/). Test files are colocated with components using `.test.tsx` suffix.

```tsx
import { render, screen } from "@/test/test-utils";
import { Button } from "./button";

test("renders button text", () => {
  render(<Button>Click me</Button>);
  expect(screen.getByRole("button")).toHaveTextContent("Click me");
});
```

The custom `render` from `@/test/test-utils` wraps components with any global providers you add.

## CI/CD

GitHub Actions workflow (`.github/workflows/ci.yml`) runs on push/PR to `main`/`master`:

1. **Lint** — Biome checks
2. **Knip** — Unused code detection
3. **Type Check** — TypeScript validation
4. **Test** — Vitest test suite
5. **Build** — Production build
6. **Deploy** — Auto-deploy to GitHub Pages (push to main only)
