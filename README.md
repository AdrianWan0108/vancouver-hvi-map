# Vancouver HVI Map

Frontend application for exploring Metro Vancouver heat-vulnerability data in the browser.

This repository contains the React + TypeScript + Vite map client. It consumes prebuilt PMTiles vector tiles and a generated search index, then exposes them through a multi-scale MapLibre interface.

## Stack

- React 19
- TypeScript
- Vite
- MapLibre GL JS
- PMTiles
- Tailwind CSS 4
- Radix/shadcn UI primitives

## Features

- Multi-scale map that switches between regional and dissemination-area (DA) views
- Choropleth layers for composite HVI, component scores, and selected underlying indicators
- Left-side summary panel for the active region or DA
- Expandable DA detail panels with per-indicator bars and values
- Search for regions, DAUIDs, places, and street addresses
- Range-based filtering for DA-level layers
- Optional peripheral-area toggle
- In-app legend and methodology/help content

## Runtime Data

The app expects these assets to exist under `public/`:

- `public/tiles/hvi_da.pmtiles`
- `public/tiles/hvi_regions.pmtiles`
- `public/search/hvi-search-index.json`

Expected source-layer names inside the tiles:

- DA tiles: `hvi_da`
- Region tiles: `hvi_regions`

The map client treats these files as read-only runtime inputs. Updating the underlying HVI data means replacing the tile files and, when needed, regenerating the search index.

## Getting Started

Install dependencies:

```bash
npm install
```

Start the Vite dev server:

```bash
npm run dev
```

Create a production build:

```bash
npm run build
```

Preview the production build locally:

```bash
npm run preview
```

## Scripts

- `npm run dev` - start the development server
- `npm run build` - type-check and build the app
- `npm run preview` - serve the production build locally
- `npm run lint` - run ESLint
- `npm run test` - run the default Vitest suite
- `npm run test:watch` - run Vitest in watch mode
- `npm run generate:search-index` - rebuild `public/search/hvi-search-index.json` from the PMTiles files
- `npm run deploy` - build and publish `dist/` to GitHub Pages via `gh-pages`

## Search

Search combines two sources:

- A local search index for region and DA results
- Optional BC Address Geocoder lookups for place/address search

The local index is loaded from `public/search/hvi-search-index.json`. If you replace the PMTiles data and need updated region/DA search metadata, regenerate the file with:

```bash
npm run generate:search-index
```

### Optional BC geocoder API key

Address search works against the BC Address Geocoder. You can optionally provide a browser-exposed API key through Vite:

```env
VITE_BC_GEOCODER_API_KEY=your_key_here
```

Put this in `.env.local` for local development or in the appropriate environment file for deployment.

If no key is provided, the app still attempts anonymous requests.

## Project Layout

```txt
src/
  components/
    MapView.tsx
    ui/
  features/
    hvi-map/
      components/
      config/
      map/
      search/
      state/
      types/
      utils/
  lib/
  main.tsx

public/
  search/
  tiles/

scripts/
  generate-search-index.mjs

tests/
  hvi-map/
```

Key areas:

- `src/components/MapView.tsx` is the thin app-level wrapper
- `src/features/hvi-map/components/` contains the page, panels, legends, and search UI
- `src/features/hvi-map/map/` contains MapLibre sources, layers, expressions, and controller logic
- `src/features/hvi-map/state/` contains the reducer, selectors, and React context wiring
- `src/features/hvi-map/search/` contains local search loading, peripheral-area logic, and BC geocoder integration
- `scripts/generate-search-index.mjs` rebuilds the local search asset from the PMTiles files

## Deployment

The app is currently configured for GitHub Pages. `vite.config.ts` sets:

- `base: "/vancouver-hvi-map/"`

If you deploy the app somewhere else, update the Vite `base` setting to match the new public path.

To publish the current build to GitHub Pages:

```bash
npm run deploy
```

## Notes

- Region and DA behavior differs by zoom level; some controls only apply in DA mode.
- The search placeholder and loading state depend on the local search index being available.
- The default test command follows the current Vitest config in `vitest.config.ts`.
