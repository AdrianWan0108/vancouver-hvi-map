import type { DaFeatureProperties } from "../types/data";

export const DA_METRIC_IDS = [
  "hvi_index_n01",
  "sensitivity_index",
  "adaptive_capacity_index",
  "exposure_index",
  "exposure_mean",
  "pop_total",
  "unemployment_rate",
  "low_income_rate",
  "pct_seniors_65plus",
  "pct_living_alone",
  "green_frac",
  "frac_coniferous",
  "frac_deciduous",
  "frac_shrub",
  "frac_modified_herb",
  "frac_natural_herb",
] as const;

export type DaMetricId = (typeof DA_METRIC_IDS)[number];
export type DaMetricPaletteId = "orange-green";
export type DaMetricCategory =
  | "HVI"
  | "Exposure"
  | "Socioeconomic"
  | "Population"
  | "Greenness";
export type DaMetricValueType =
  | "index"
  | "ratio"
  | "percentage"
  | "count"
  | "number";
export type DaMetricFormatId =
  | "score3"
  | "percent1"
  | "integer"
  | "number2";
export type NoDataPolicy = "transparent";

export interface DaMetricConfig {
  id: DaMetricId;
  propertyKey: Extract<keyof DaFeatureProperties, string>;
  label: string;
  category: DaMetricCategory;
  valueType: DaMetricValueType;
  defaultMin: number | null;
  defaultMax: number | null;
  format: DaMetricFormatId;
  paletteId: DaMetricPaletteId;
  noDataPolicy: NoDataPolicy;
}

export const DEFAULT_DA_METRIC_ID: DaMetricId = "hvi_index_n01";

export const DA_METRICS: readonly DaMetricConfig[] = [
  {
    id: "hvi_index_n01",
    propertyKey: "hvi_index_n01",
    label: "HVI (0-1)",
    category: "HVI",
    valueType: "index",
    defaultMin: 0,
    defaultMax: 1,
    format: "score3",
    paletteId: "orange-green",
    noDataPolicy: "transparent",
  },
  {
    id: "sensitivity_index",
    propertyKey: "sensitivity_index",
    label: "Sensitivity Index",
    category: "HVI",
    valueType: "index",
    defaultMin: 0,
    defaultMax: 1,
    format: "score3",
    paletteId: "orange-green",
    noDataPolicy: "transparent",
  },
  {
    id: "adaptive_capacity_index",
    propertyKey: "adaptive_capacity_index",
    label: "Adaptive Capacity Index",
    category: "HVI",
    valueType: "index",
    defaultMin: 0,
    defaultMax: 1,
    format: "score3",
    paletteId: "orange-green",
    noDataPolicy: "transparent",
  },
  {
    id: "exposure_index",
    propertyKey: "exposure_index",
    label: "Exposure Index",
    category: "Exposure",
    valueType: "index",
    defaultMin: 0,
    defaultMax: 1,
    format: "score3",
    paletteId: "orange-green",
    noDataPolicy: "transparent",
  },
  {
    id: "exposure_mean",
    propertyKey: "exposure_mean",
    label: "Exposure Mean (deg C)",
    category: "Exposure",
    valueType: "number",
    defaultMin: 20,
    defaultMax: 40,
    format: "number2",
    paletteId: "orange-green",
    noDataPolicy: "transparent",
  },
  {
    id: "pop_total",
    propertyKey: "pop_total",
    label: "Population",
    category: "Population",
    valueType: "count",
    defaultMin: 0,
    defaultMax: 5000,
    format: "integer",
    paletteId: "orange-green",
    noDataPolicy: "transparent",
  },
  {
    id: "unemployment_rate",
    propertyKey: "unemployment_rate",
    label: "Unemployment Rate (%)",
    category: "Socioeconomic",
    valueType: "percentage",
    defaultMin: 0,
    defaultMax: 30,
    format: "percent1",
    paletteId: "orange-green",
    noDataPolicy: "transparent",
  },
  {
    id: "low_income_rate",
    propertyKey: "low_income_rate",
    label: "Low Income Rate (%)",
    category: "Socioeconomic",
    valueType: "percentage",
    defaultMin: 0,
    defaultMax: 50,
    format: "percent1",
    paletteId: "orange-green",
    noDataPolicy: "transparent",
  },
  {
    id: "pct_seniors_65plus",
    propertyKey: "pct_seniors_65plus",
    label: "% Seniors 65+",
    category: "Socioeconomic",
    valueType: "percentage",
    defaultMin: 0,
    defaultMax: 50,
    format: "percent1",
    paletteId: "orange-green",
    noDataPolicy: "transparent",
  },
  {
    id: "pct_living_alone",
    propertyKey: "pct_living_alone",
    label: "% Living Alone",
    category: "Socioeconomic",
    valueType: "percentage",
    defaultMin: 0,
    defaultMax: 50,
    format: "percent1",
    paletteId: "orange-green",
    noDataPolicy: "transparent",
  },
  {
    id: "green_frac",
    propertyKey: "green_frac",
    label: "Green Fraction",
    category: "Greenness",
    valueType: "ratio",
    defaultMin: 0,
    defaultMax: 1,
    format: "score3",
    paletteId: "orange-green",
    noDataPolicy: "transparent",
  },
  {
    id: "frac_coniferous",
    propertyKey: "frac_coniferous",
    label: "Coniferous Fraction",
    category: "Greenness",
    valueType: "ratio",
    defaultMin: 0,
    defaultMax: 1,
    format: "score3",
    paletteId: "orange-green",
    noDataPolicy: "transparent",
  },
  {
    id: "frac_deciduous",
    propertyKey: "frac_deciduous",
    label: "Deciduous Fraction",
    category: "Greenness",
    valueType: "ratio",
    defaultMin: 0,
    defaultMax: 1,
    format: "score3",
    paletteId: "orange-green",
    noDataPolicy: "transparent",
  },
  {
    id: "frac_shrub",
    propertyKey: "frac_shrub",
    label: "Shrub Fraction",
    category: "Greenness",
    valueType: "ratio",
    defaultMin: 0,
    defaultMax: 1,
    format: "score3",
    paletteId: "orange-green",
    noDataPolicy: "transparent",
  },
  {
    id: "frac_modified_herb",
    propertyKey: "frac_modified_herb",
    label: "Modified Herb Fraction",
    category: "Greenness",
    valueType: "ratio",
    defaultMin: 0,
    defaultMax: 1,
    format: "score3",
    paletteId: "orange-green",
    noDataPolicy: "transparent",
  },
  {
    id: "frac_natural_herb",
    propertyKey: "frac_natural_herb",
    label: "Natural Herb Fraction",
    category: "Greenness",
    valueType: "ratio",
    defaultMin: 0,
    defaultMax: 1,
    format: "score3",
    paletteId: "orange-green",
    noDataPolicy: "transparent",
  },
];

const metricsById: Record<DaMetricId, DaMetricConfig> = {
  hvi_index_n01: DA_METRICS[0],
  sensitivity_index: DA_METRICS[1],
  adaptive_capacity_index: DA_METRICS[2],
  exposure_index: DA_METRICS[3],
  exposure_mean: DA_METRICS[4],
  pop_total: DA_METRICS[5],
  unemployment_rate: DA_METRICS[6],
  low_income_rate: DA_METRICS[7],
  pct_seniors_65plus: DA_METRICS[8],
  pct_living_alone: DA_METRICS[9],
  green_frac: DA_METRICS[10],
  frac_coniferous: DA_METRICS[11],
  frac_deciduous: DA_METRICS[12],
  frac_shrub: DA_METRICS[13],
  frac_modified_herb: DA_METRICS[14],
  frac_natural_herb: DA_METRICS[15],
};

export const DA_METRICS_BY_ID = metricsById;

export function getDaMetricConfig(metricId: DaMetricId): DaMetricConfig {
  return DA_METRICS_BY_ID[metricId];
}

export function isDaMetricId(value: string): value is DaMetricId {
  return (DA_METRIC_IDS as readonly string[]).includes(value);
}
