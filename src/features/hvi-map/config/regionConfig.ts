import type {
  DaMetricFormatId,
  MetricDisplayScaleStrategy,
  MetricPaletteId,
} from "./daMetrics";
import type { RegionFeatureProperties } from "../types/data";
import type { SearchBounds } from "../types/search";

export const ZOOM_DA = 10.5;
export const METRO_VANCOUVER_DEFAULT_VIEW_BOUNDS: SearchBounds = [
  -123.295441,
  49.001844,
  -122.409668,
  49.414547,
];
export const METRO_VANCOUVER_SEARCH_BOUNDS: SearchBounds = [
  -123.739014,
  49.001844,
  -122.409668,
  49.477048,
];
export const PERIPHERAL_REGION_POPULATION_THRESHOLD = 5000;
export const PERIPHERAL_REGION_MANUAL_INCLUDE_KEYS = [6] as const;
export const PERIPHERAL_REGION_MANUAL_EXCLUDE_KEYS = [] as const;

export interface RegionMetricConfig {
  propertyKey: Extract<keyof RegionFeatureProperties, string>;
  label: string;
  format: DaMetricFormatId;
  domainMin: number;
  domainMax: number;
  displayScaleStrategy: MetricDisplayScaleStrategy;
  displayDomainMin: number;
  displayDomainMax: number;
  paletteId: MetricPaletteId;
}

export const REGION_HVI_METRIC: RegionMetricConfig = {
  propertyKey: "region_hvi_n01",
  label: "Regional HVI",
  format: "score3",
  domainMin: 0.13220740737301004,
  domainMax: 0.44369914336879274,
  displayScaleStrategy: "p05-p95",
  displayDomainMin: 0.13887,
  displayDomainMax: 0.437972,
  paletteId: "hvi",
};

export const PMTILES_FILES = {
  da: "tiles/hvi_da.pmtiles",
  regions: "tiles/hvi_regions.pmtiles",
} as const;
