# HeatScope Van

Interactive web map for exploring heat vulnerability across Metro Vancouver.

This repository contains the React + TypeScript + Vite frontend for the project. It renders prebuilt PMTiles vector tiles and a generated local search index through a multi-scale MapLibre interface.

The HVI data-processing workflow does **not** live here. That work is handled by the companion repository:

- `../vancouver-hvi-pipeline`

That pipeline produces the final GeoJSON outputs that are later packaged into the two PMTiles files used by this app.

## Features

- Multi-scale map that switches between regional and dissemination-area views
- Choropleth layers for HVI, component scores, and selected indicator layers
- Left-side summaries for active regions and DAs
- Expandable DA detail panels with indicator values and mini bars
- Search for regions, DAUIDs, places, and street addresses
- Range-based DA filtering
- Optional peripheral-area toggle
- In-app legend, onboarding, and "How HVI is built" methodology content

## Stack

- React 19
- TypeScript
- Vite
- MapLibre GL JS
- PMTiles
- Tailwind CSS 4
- Radix/shadcn UI primitives

## Runtime Data

The app expects these runtime assets under `public/`:

- `public/tiles/hvi_da.pmtiles`
- `public/tiles/hvi_regions.pmtiles`
- `public/search/hvi-search-index.json`

Expected source-layer names inside the PMTiles archives:

- DA tiles: `hvi_da`
- Region tiles: `hvi_regions`

These files are treated as read-only runtime inputs by the frontend. If the underlying HVI data changes, replace the PMTiles files and then regenerate the search index.

## Where the PMTiles Come From

The two PMTiles files used by this frontend are derived from the final GeoJSON outputs produced by the companion pipeline repo:

- `../vancouver-hvi-pipeline`

Relevant pipeline outputs:

- `outputs/hvi_da.geojson`
- `outputs/hvi_regions.geojson`

Those GeoJSON files are created in the pipeline by `scripts/05_build_hvi_outputs.py`. They are then packaged into vector tiles with `tippecanoe` and converted to PMTiles with `npx pmtiles`.

### Pipeline-to-Frontend Flow

1. Run the data pipeline in `../vancouver-hvi-pipeline` through `05_build_hvi_outputs.py`.
2. In the pipeline repo, package the final GeoJSON outputs into PMTiles.
3. Copy the resulting PMTiles files into this repo's `public/tiles/` directory.
4. In this frontend repo, regenerate `public/search/hvi-search-index.json`.

### Example Commands in the Pipeline Repo

From `../vancouver-hvi-pipeline`:

```bash
python scripts/05_build_hvi_outputs.py

tippecanoe -o outputs/hvi_da.mbtiles \
  -l hvi_da \
  -zg \
  --read-parallel \
  --drop-densest-as-needed \
  --extend-zooms-if-still-dropping \
  outputs/hvi_da.geojson

tippecanoe -o outputs/hvi_regions.mbtiles \
  -l hvi_regions \
  -zg \
  --read-parallel \
  --drop-densest-as-needed \
  --extend-zooms-if-still-dropping \
  outputs/hvi_regions.geojson

npx pmtiles convert outputs/hvi_da.mbtiles outputs/hvi_da.pmtiles
npx pmtiles convert outputs/hvi_regions.mbtiles outputs/hvi_regions.pmtiles
```

### Copy the PMTiles into This Repo

From this repository root on Windows PowerShell:

```powershell
Copy-Item ..\vancouver-hvi-pipeline\outputs\hvi_da.pmtiles public\tiles\
Copy-Item ..\vancouver-hvi-pipeline\outputs\hvi_regions.pmtiles public\tiles\
```

### Regenerate the Local Search Index

After replacing either PMTiles file, rebuild the local search asset:

```bash
npm run generate:search-index
```

That script reads the two PMTiles archives, extracts region and DA metadata, and writes:

- `public/search/hvi-search-index.json`

## Getting Started

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

Run the full test suite:

```bash
npm run test
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
- `npm run test` - run the full Vitest suite, including React render tests
- `npm run test:watch` - run Vitest in watch mode
- `npm run generate:search-index` - rebuild `public/search/hvi-search-index.json` from the two PMTiles files
- `npm run deploy` - build and publish `dist/` to GitHub Pages via `gh-pages`

## Search

Search combines two sources:

- A local search index for regions and DAs
- Optional BC Address Geocoder lookups for places and street addresses

The local index is loaded from `public/search/hvi-search-index.json`.

### Optional BC geocoder API key

Address search uses the BC Address Geocoder. You can optionally provide a browser-exposed API key through Vite:

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
      assets/
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
  map_icon.png
  search/
  tiles/

scripts/
  generate-search-index.mjs

tests/
  hvi-map/
```

Key areas:

- [`src/components/MapView.tsx`](src/components/MapView.tsx) is the thin app-level wrapper
- [`src/features/hvi-map/components/`](src/features/hvi-map/components) contains the page, panels, guides, legends, and search UI
- [`src/features/hvi-map/map/`](src/features/hvi-map/map) contains MapLibre sources, layers, expressions, and controller logic
- [`src/features/hvi-map/state/`](src/features/hvi-map/state) contains the reducer, selectors, and React context wiring
- [`src/features/hvi-map/search/`](src/features/hvi-map/search) contains local search loading, peripheral-area logic, and BC geocoder integration
- [`scripts/generate-search-index.mjs`](scripts/generate-search-index.mjs) rebuilds the local search asset from the PMTiles files

## Deployment

The app is currently configured for GitHub Pages. [`vite.config.ts`](vite.config.ts) sets:

- `base: "/vancouver-hvi-map/"`

If you deploy the app somewhere else, update the Vite `base` setting to match the new public path.

To publish the current build to GitHub Pages:

```bash
npm run deploy
```

## Notes

- This repo is the frontend artefact. HVI construction and final GeoJSON generation happen in the companion pipeline repo.
- The current build depends on the bundled runtime data in `public/tiles/` and `public/search/`.
- Region and DA behavior differs by zoom level; some controls only apply in DA mode.
- If the PMTiles layer names change, update both the tile-packaging commands and the frontend source-layer configuration.
