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
  "pct_renter",
  "pct_core_need",
  "pct_major_repairs",
  "green_frac",
  "frac_coniferous",
  "frac_deciduous",
  "frac_shrub",
  "frac_buildings",
  "frac_other_built",
  "frac_paved",
  "hardscape_frac",
] as const;

export type DaMetricId = (typeof DA_METRIC_IDS)[number];
export type MetricPaletteId = "risk" | "benefit" | "density";
export type DaMetricCategory =
  | "HVI"
  | "Exposure"
  | "Population"
  | "Social & Housing"
  | "Land Cover & Built";
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
  format: DaMetricFormatId;
  domainMin: number;
  domainMax: number;
  paletteId: MetricPaletteId;
  noDataPolicy: NoDataPolicy;
}

export const DEFAULT_DA_METRIC_ID: DaMetricId = "hvi_index_n01";

export const DA_METRICS: readonly DaMetricConfig[] = [
  {
    id: "hvi_index_n01",
    propertyKey: "hvi_index_n01",
    label: "HVI (0-1)",
    category: "HVI",
    format: "score3",
    domainMin: 0.06462950439663971,
    domainMax: 0.733616020899424,
    paletteId: "risk",
    noDataPolicy: "transparent",
  },
  {
    id: "sensitivity_index",
    propertyKey: "sensitivity_index",
    label: "Sensitivity Index",
    category: "HVI",
    format: "score3",
    domainMin: 0,
    domainMax: 0.7991342281879195,
    paletteId: "risk",
    noDataPolicy: "transparent",
  },
  {
    id: "adaptive_capacity_index",
    propertyKey: "adaptive_capacity_index",
    label: "Adaptive Capacity Index",
    category: "HVI",
    format: "score3",
    domainMin: 0.0091336884032457,
    domainMax: 1,
    paletteId: "benefit",
    noDataPolicy: "transparent",
  },
  {
    id: "exposure_index",
    propertyKey: "exposure_index",
    label: "Exposure Index",
    category: "Exposure",
    format: "score3",
    domainMin: 0,
    domainMax: 0.9705087479648702,
    paletteId: "risk",
    noDataPolicy: "transparent",
  },
  {
    id: "exposure_mean",
    propertyKey: "exposure_mean",
    label: "Exposure Mean (deg C)",
    category: "Exposure",
    format: "number2",
    domainMin: 17.54,
    domainMax: 32.352,
    paletteId: "risk",
    noDataPolicy: "transparent",
  },
  {
    id: "pop_total",
    propertyKey: "pop_total",
    label: "Population",
    category: "Population",
    format: "integer",
    domainMin: 0,
    domainMax: 8800,
    paletteId: "density",
    noDataPolicy: "transparent",
  },
  {
    id: "unemployment_rate",
    propertyKey: "unemployment_rate",
    label: "Unemployment Rate (%)",
    category: "Social & Housing",
    format: "percent1",
    domainMin: 0,
    domainMax: 50,
    paletteId: "risk",
    noDataPolicy: "transparent",
  },
  {
    id: "low_income_rate",
    propertyKey: "low_income_rate",
    label: "Low Income Rate (%)",
    category: "Social & Housing",
    format: "percent1",
    domainMin: 1.4,
    domainMax: 61,
    paletteId: "risk",
    noDataPolicy: "transparent",
  },
  {
    id: "pct_seniors_65plus",
    propertyKey: "pct_seniors_65plus",
    label: "% Seniors 65+",
    category: "Social & Housing",
    format: "percent1",
    domainMin: 0.7824726134585289,
    domainMax: 65.44502617801047,
    paletteId: "risk",
    noDataPolicy: "transparent",
  },
  {
    id: "pct_living_alone",
    propertyKey: "pct_living_alone",
    label: "% Living Alone",
    category: "Social & Housing",
    format: "percent1",
    domainMin: 0,
    domainMax: 57.59162303664922,
    paletteId: "risk",
    noDataPolicy: "transparent",
  },
  {
    id: "pct_renter",
    propertyKey: "pct_renter",
    label: "% Renters",
    category: "Social & Housing",
    format: "percent1",
    domainMin: 0,
    domainMax: 100,
    paletteId: "risk",
    noDataPolicy: "transparent",
  },
  {
    id: "pct_core_need",
    propertyKey: "pct_core_need",
    label: "% Core Housing Need",
    category: "Social & Housing",
    format: "percent1",
    domainMin: 0,
    domainMax: 75,
    paletteId: "risk",
    noDataPolicy: "transparent",
  },
  {
    id: "pct_major_repairs",
    propertyKey: "pct_major_repairs",
    label: "% Major Repairs",
    category: "Social & Housing",
    format: "percent1",
    domainMin: 0,
    domainMax: 57.89473684210527,
    paletteId: "risk",
    noDataPolicy: "transparent",
  },
  {
    id: "green_frac",
    propertyKey: "green_frac",
    label: "Green Fraction",
    category: "Land Cover & Built",
    format: "score3",
    domainMin: 0,
    domainMax: 0.9769045884923524,
    paletteId: "benefit",
    noDataPolicy: "transparent",
  },
  {
    id: "frac_coniferous",
    propertyKey: "frac_coniferous",
    label: "Coniferous Fraction",
    category: "Land Cover & Built",
    format: "score3",
    domainMin: 0,
    domainMax: 0.9623840738043214,
    paletteId: "benefit",
    noDataPolicy: "transparent",
  },
  {
    id: "frac_deciduous",
    propertyKey: "frac_deciduous",
    label: "Deciduous Fraction",
    category: "Land Cover & Built",
    format: "score3",
    domainMin: 0,
    domainMax: 0.6710048679302096,
    paletteId: "benefit",
    noDataPolicy: "transparent",
  },
  {
    id: "frac_shrub",
    propertyKey: "frac_shrub",
    label: "Shrub Fraction",
    category: "Land Cover & Built",
    format: "score3",
    domainMin: 0,
    domainMax: 0.2334325083523095,
    paletteId: "benefit",
    noDataPolicy: "transparent",
  },
  {
    id: "frac_buildings",
    propertyKey: "frac_buildings",
    label: "Buildings Fraction",
    category: "Land Cover & Built",
    format: "score3",
    domainMin: 0,
    domainMax: 0.6209677419354839,
    paletteId: "risk",
    noDataPolicy: "transparent",
  },
  {
    id: "frac_other_built",
    propertyKey: "frac_other_built",
    label: "Other Built Fraction",
    category: "Land Cover & Built",
    format: "score3",
    domainMin: 0,
    domainMax: 0.3625834695630489,
    paletteId: "risk",
    noDataPolicy: "transparent",
  },
  {
    id: "frac_paved",
    propertyKey: "frac_paved",
    label: "Paved Fraction",
    category: "Land Cover & Built",
    format: "score3",
    domainMin: 0,
    domainMax: 0.734375,
    paletteId: "risk",
    noDataPolicy: "transparent",
  },
  {
    id: "hardscape_frac",
    propertyKey: "hardscape_frac",
    label: "Hardscape Fraction",
    category: "Land Cover & Built",
    format: "score3",
    domainMin: 0,
    domainMax: 1,
    paletteId: "risk",
    noDataPolicy: "transparent",
  },
] as const;

const metricsById = Object.fromEntries(
  DA_METRICS.map((metric) => [metric.id, metric])
) as Record<DaMetricId, DaMetricConfig>;

export const DA_METRICS_BY_ID = metricsById;

export function getDaMetricConfig(metricId: DaMetricId): DaMetricConfig {
  return DA_METRICS_BY_ID[metricId];
}

export function isDaMetricId(value: string): value is DaMetricId {
  return (DA_METRIC_IDS as readonly string[]).includes(value);
}
