import type { MetricPaletteId } from "./daMetrics";

export interface MetricPaletteConfig {
  id: MetricPaletteId;
  description: string;
  stops: [string, string, string];
}

export const METRIC_PALETTES: Record<MetricPaletteId, MetricPaletteConfig> = {
  hvi: {
    id: "hvi",
    description: "Higher values indicate greater overall heat vulnerability.",
    stops: ["#fff1d6", "#f0a35f", "#9b2226"],
  },
  heat: {
    id: "heat",
    description: "Higher values indicate greater heat exposure.",
    stops: ["#fff4de", "#e7a34d", "#bb6a1e"],
  },
  social: {
    id: "social",
    description: "Higher values indicate greater social sensitivity or vulnerability.",
    stops: ["#fbf1f7", "#c08ab8", "#6c3a75"],
  },
  housing: {
    id: "housing",
    description: "Higher values indicate greater housing stress.",
    stops: ["#fff0e7", "#d88766", "#934534"],
  },
  adaptive: {
    id: "adaptive",
    description: "Higher values indicate more protective green cover or adaptive capacity.",
    stops: ["#eef7e8", "#78a67e", "#1b4332"],
  },
  context: {
    id: "context",
    description: "Higher values indicate more people in the selected area.",
    stops: ["#edf4ff", "#6c8ef6", "#1d4f8c"],
  },
  built: {
    id: "built",
    description: "Higher values indicate more hard or built surface cover contributing to heat exposure.",
    stops: ["#f6efe2", "#c79b58", "#7a5a2f"],
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
