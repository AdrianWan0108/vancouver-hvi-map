import type { MetricPaletteId } from "./daMetrics";

export interface MetricPaletteConfig {
  id: MetricPaletteId;
  description: string;
  stops: [string, string, string];
}

export const METRIC_PALETTES: Record<MetricPaletteId, MetricPaletteConfig> = {
  risk: {
    id: "risk",
    description: "Higher values indicate greater heat vulnerability or risk.",
    stops: ["#fff1d6", "#f4a261", "#9b2226"],
  },
  benefit: {
    id: "benefit",
    description: "Higher values indicate more protective land cover or adaptive capacity.",
    stops: ["#eef7e8", "#74a57f", "#1b4332"],
  },
  density: {
    id: "density",
    description: "Higher values indicate more people in the selected area.",
    stops: ["#edf4ff", "#5b7cfa", "#1d3557"],
  },
};

export function getPaletteConfig(paletteId: MetricPaletteId): MetricPaletteConfig {
  return METRIC_PALETTES[paletteId];
}

export function getPaletteStops(
  paletteId: MetricPaletteId
): [string, string, string] {
  return METRIC_PALETTES[paletteId].stops;
}
