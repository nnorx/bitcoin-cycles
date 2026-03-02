# Bitcoin Cycles

A Bitcoin cycle visualizer that charts yearly performance, halving-aligned epochs, and peak/bottom cycles using D3.js. Compare any combination of years or cycles, filter by 4-year cycle groups, and overlay computed averages.

![Bitcoin Cycles — Year View](https://nnorx.github.io/bitcoin-cycles/screenshot-year.png)

<details>
<summary>Epoch View</summary>

![Bitcoin Cycles — Epoch View](https://nnorx.github.io/bitcoin-cycles/screenshot-epoch.png)

</details>

<details>
<summary>Cycle View</summary>

![Bitcoin Cycles — Cycle View](https://nnorx.github.io/bitcoin-cycles/screenshot-cycle.png)

</details>

## Features

- **Year View** — Each year's BTC performance as % return from Jan 1, overlaid on a single chart
- **Epoch View** — Performance aligned to Bitcoin halving dates (2012, 2016, 2020, 2024)
- **Cycle View** — Visualize peak-to-bottom (bear) and bottom-to-peak (recovery) phases across Bitcoin cycles
- **Log / Linear Scale** — Toggle between scale modes
- **Year Group Filters** — Quick-select Election, Post-Election, Midterm, or Pre-Election years
- **Average Lines** — Toggle dashed average lines for any group, or average the currently visible series
- **Crosshair Tooltip** — Hover to see % return for all visible series at any day
- **Dark / Light Theme** — Adapts chart colors automatically

## Getting Started

```bash
pnpm install
pnpm dev
```

Optionally create a `.env.local` with a [CoinGecko API key](https://www.coingecko.com/en/api/pricing) for higher rate limits:

```
VITE_COINGECKO_API_KEY=your_key_here
```

The app bundles full BTC price history and fetches recent data from CoinGecko. It works without an API key.

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
| `pnpm knip` | Find unused code and dependencies |

## Stack

- **React 19** with React Compiler
- **TypeScript** (strict mode)
- **D3.js** (scales, shapes, arrays, formatting — no DOM manipulation)
- **Vite** (rolldown-vite)
- **Tailwind CSS v4**
- **Biome** for linting and formatting
- **Vitest** + React Testing Library
