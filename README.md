# Vancouver HVI Map

React + TypeScript + Vite web map for exploring Vancouver Heat Vulnerability Index (HVI) data from local PMTiles vector tiles.

## What This App Does

- Displays a **regional choropleth** at lower zoom.
- Automatically switches to **DA-level choropleth** at higher zoom.
- Keeps a **left data panel** always visible.
- Supports DA **hover details** and **click-to-lock** behavior.
- Lets users select DA visualization layers from a dropdown.
- Provides a DA filter menu with min/max range filtering (AND logic across enabled filters).

## Data Inputs

The app reads two PMTiles files from `public/tiles/`:

- `hvi_da.pmtiles`
- `hvi_regions.pmtiles`

Expected source-layer names:

- DA: `hvi_da`
- Region: `hvi_regions`

## Project Structure

```txt
src/
  features/
    hvi-map/
      config/
      map/
      state/
      types/
      utils/
      components/
  components/
    MapView.tsx
```

`src/components/MapView.tsx` is now a thin wrapper that renders the feature module entrypoint.

## Development

```bash
npm run dev
```

## Lint

```bash
npm run lint
```

## Tests

```bash
npm run test
```

## Build

```bash
npm run build
```

## Deploy

This project is configured for GitHub Pages:

```bash
npm run deploy
```

Vite `base` is set to `/vancouver-hvi-map/`.

## Notes

- Region color is fixed to `region_hvi_n01`.
- DA layer selection and DA filters apply in DA mode.
- If a locked DA is filtered out, the panel keeps the lock and shows a warning.
