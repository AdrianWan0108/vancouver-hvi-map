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
export type MetricPaletteId =
  | "hvi"
  | "heat"
  | "social"
  | "housing"
  | "adaptive"
  | "context"
  | "built";
export type DaMetricCategory =
  | "HVI"
  | "Exposure"
  | "Population"
  | "Social & Housing"
  | "Land Cover & Built";
export type DaFilterGroup =
  | "hvi"
  | "exposure"
  | "sensitivity"
  | "adaptiveCapacity"
  | "population";
export type DaMetricFormatId =
  | "score3"
  | "percent1"
  | "integer"
  | "number2";
export type MetricDisplayScaleStrategy =
  | "p05-p95"
  | "zero-p95"
  | "p01-p99"
  | "observed";
export type NoDataPolicy = "transparent";

export interface DaMetricConfig {
  id: DaMetricId;
  propertyKey: Extract<keyof DaFeatureProperties, string>;
  label: string;
  category: DaMetricCategory;
  filterGroup: DaFilterGroup;
  format: DaMetricFormatId;
  domainMin: number;
  domainMax: number;
  displayScaleStrategy: MetricDisplayScaleStrategy;
  displayDomainMin: number;
  displayDomainMax: number;
  paletteId: MetricPaletteId;
  noDataPolicy: NoDataPolicy;
}

export const DA_FILTER_GROUPS = [
  { id: "hvi", label: "HVI" },
  { id: "exposure", label: "Exposure" },
  { id: "sensitivity", label: "Sensitivity" },
  { id: "adaptiveCapacity", label: "Adaptive Capacity" },
  { id: "population", label: "Population" },
] as const satisfies readonly { id: DaFilterGroup; label: string }[];

export const DEFAULT_DA_METRIC_ID: DaMetricId = "hvi_index_n01";

export const DA_METRICS: readonly DaMetricConfig[] = [
  {
    id: "hvi_index_n01",
    propertyKey: "hvi_index_n01",
    label: "HVI (0-1)",
    category: "HVI",
    filterGroup: "hvi",
    format: "score3",
    domainMin: 0.06462950439663971,
    domainMax: 0.733616020899424,
    displayScaleStrategy: "p05-p95",
    displayDomainMin: 0.23931,
    displayDomainMax: 0.52972,
    paletteId: "hvi",
    noDataPolicy: "transparent",
  },
  {
    id: "sensitivity_index",
    propertyKey: "sensitivity_index",
    label: "Sensitivity Index",
    category: "HVI",
    filterGroup: "sensitivity",
    format: "score3",
    domainMin: 0,
    domainMax: 0.7991342281879195,
    displayScaleStrategy: "p05-p95",
    displayDomainMin: 0.073525,
    displayDomainMax: 0.332616,
    paletteId: "social",
    noDataPolicy: "transparent",
  },
  {
    id: "adaptive_capacity_index",
    propertyKey: "adaptive_capacity_index",
    label: "Adaptive Capacity Index",
    category: "HVI",
    filterGroup: "adaptiveCapacity",
    format: "score3",
    domainMin: 0.0091336884032457,
    domainMax: 1,
    displayScaleStrategy: "p05-p95",
    displayDomainMin: 0.442555,
    displayDomainMax: 0.819452,
    paletteId: "adaptive",
    noDataPolicy: "transparent",
  },
  {
    id: "exposure_index",
    propertyKey: "exposure_index",
    label: "Exposure Index",
    category: "Exposure",
    filterGroup: "exposure",
    format: "score3",
    domainMin: 0,
    domainMax: 0.9705087479648702,
    displayScaleStrategy: "p05-p95",
    displayDomainMin: 0.359647,
    displayDomainMax: 0.840795,
    paletteId: "heat",
    noDataPolicy: "transparent",
  },
  {
    id: "exposure_mean",
    propertyKey: "exposure_mean",
    label: "Exposure Mean (deg C)",
    category: "Exposure",
    filterGroup: "exposure",
    format: "number2",
    domainMin: 17.54,
    domainMax: 32.352,
    displayScaleStrategy: "p05-p95",
    displayDomainMin: 23.61,
    displayDomainMax: 30.05,
    paletteId: "heat",
    noDataPolicy: "transparent",
  },
  {
    id: "pop_total",
    propertyKey: "pop_total",
    label: "Population",
    category: "Population",
    filterGroup: "population",
    format: "integer",
    domainMin: 0,
    domainMax: 8800,
    displayScaleStrategy: "p01-p99",
    displayDomainMin: 217.31,
    displayDomainMax: 2513.28,
    paletteId: "context",
    noDataPolicy: "transparent",
  },
  {
    id: "unemployment_rate",
    propertyKey: "unemployment_rate",
    label: "Unemployment Rate (%)",
    category: "Social & Housing",
    filterGroup: "sensitivity",
    format: "percent1",
    domainMin: 0,
    domainMax: 50,
    displayScaleStrategy: "zero-p95",
    displayDomainMin: 0,
    displayDomainMax: 16.2,
    paletteId: "social",
    noDataPolicy: "transparent",
  },
  {
    id: "low_income_rate",
    propertyKey: "low_income_rate",
    label: "Low Income Rate (%)",
    category: "Social & Housing",
    filterGroup: "sensitivity",
    format: "percent1",
    domainMin: 1.4,
    domainMax: 61,
    displayScaleStrategy: "p05-p95",
    displayDomainMin: 3.6,
    displayDomainMax: 22,
    paletteId: "social",
    noDataPolicy: "transparent",
  },
  {
    id: "pct_seniors_65plus",
    propertyKey: "pct_seniors_65plus",
    label: "% Seniors 65+",
    category: "Social & Housing",
    filterGroup: "sensitivity",
    format: "percent1",
    domainMin: 0.7824726134585289,
    domainMax: 65.44502617801047,
    displayScaleStrategy: "p05-p95",
    displayDomainMin: 3.181677,
    displayDomainMax: 21.982034,
    paletteId: "social",
    noDataPolicy: "transparent",
  },
  {
    id: "pct_living_alone",
    propertyKey: "pct_living_alone",
    label: "% Living Alone",
    category: "Social & Housing",
    filterGroup: "sensitivity",
    format: "percent1",
    domainMin: 0,
    domainMax: 57.59162303664922,
    displayScaleStrategy: "p05-p95",
    displayDomainMin: 2.388535,
    displayDomainMax: 33.797171,
    paletteId: "social",
    noDataPolicy: "transparent",
  },
  {
    id: "pct_renter",
    propertyKey: "pct_renter",
    label: "% Renters",
    category: "Social & Housing",
    filterGroup: "adaptiveCapacity",
    format: "percent1",
    domainMin: 0,
    domainMax: 100,
    displayScaleStrategy: "p05-p95",
    displayDomainMin: 6.666667,
    displayDomainMax: 80.304272,
    paletteId: "housing",
    noDataPolicy: "transparent",
  },
  {
    id: "pct_core_need",
    propertyKey: "pct_core_need",
    label: "% Core Housing Need",
    category: "Social & Housing",
    filterGroup: "adaptiveCapacity",
    format: "percent1",
    domainMin: 0,
    domainMax: 75,
    displayScaleStrategy: "zero-p95",
    displayDomainMin: 0,
    displayDomainMax: 32.288306,
    paletteId: "housing",
    noDataPolicy: "transparent",
  },
  {
    id: "pct_major_repairs",
    propertyKey: "pct_major_repairs",
    label: "% Major Repairs",
    category: "Social & Housing",
    filterGroup: "adaptiveCapacity",
    format: "percent1",
    domainMin: 0,
    domainMax: 57.89473684210527,
    displayScaleStrategy: "zero-p95",
    displayDomainMin: 0,
    displayDomainMax: 13.636364,
    paletteId: "housing",
    noDataPolicy: "transparent",
  },
  {
    id: "green_frac",
    propertyKey: "green_frac",
    label: "Green Fraction",
    category: "Land Cover & Built",
    filterGroup: "adaptiveCapacity",
    format: "score3",
    domainMin: 0,
    domainMax: 0.9769045884923524,
    displayScaleStrategy: "p05-p95",
    displayDomainMin: 0.034259,
    displayDomainMax: 0.547479,
    paletteId: "adaptive",
    noDataPolicy: "transparent",
  },
  {
    id: "frac_coniferous",
    propertyKey: "frac_coniferous",
    label: "Coniferous Fraction",
    category: "Land Cover & Built",
    filterGroup: "adaptiveCapacity",
    format: "score3",
    domainMin: 0,
    domainMax: 0.9623840738043214,
    displayScaleStrategy: "zero-p95",
    displayDomainMin: 0,
    displayDomainMax: 0.181717,
    paletteId: "adaptive",
    noDataPolicy: "transparent",
  },
  {
    id: "frac_deciduous",
    propertyKey: "frac_deciduous",
    label: "Deciduous Fraction",
    category: "Land Cover & Built",
    filterGroup: "adaptiveCapacity",
    format: "score3",
    domainMin: 0,
    domainMax: 0.6710048679302096,
    displayScaleStrategy: "p05-p95",
    displayDomainMin: 0.023555,
    displayDomainMax: 0.385317,
    paletteId: "adaptive",
    noDataPolicy: "transparent",
  },
  {
    id: "frac_shrub",
    propertyKey: "frac_shrub",
    label: "Shrub Fraction",
    category: "Land Cover & Built",
    filterGroup: "adaptiveCapacity",
    format: "score3",
    domainMin: 0,
    domainMax: 0.2334325083523095,
    displayScaleStrategy: "zero-p95",
    displayDomainMin: 0,
    displayDomainMax: 0.080396,
    paletteId: "adaptive",
    noDataPolicy: "transparent",
  },
  {
    id: "frac_buildings",
    propertyKey: "frac_buildings",
    label: "Buildings Fraction",
    category: "Land Cover & Built",
    filterGroup: "exposure",
    format: "score3",
    domainMin: 0,
    domainMax: 0.6209677419354839,
    displayScaleStrategy: "p05-p95",
    displayDomainMin: 0.037787,
    displayDomainMax: 0.422276,
    paletteId: "built",
    noDataPolicy: "transparent",
  },
  {
    id: "frac_other_built",
    propertyKey: "frac_other_built",
    label: "Other Built Fraction",
    category: "Land Cover & Built",
    filterGroup: "exposure",
    format: "score3",
    domainMin: 0,
    domainMax: 0.3625834695630489,
    displayScaleStrategy: "zero-p95",
    displayDomainMin: 0,
    displayDomainMax: 0.010273,
    paletteId: "built",
    noDataPolicy: "transparent",
  },
  {
    id: "frac_paved",
    propertyKey: "frac_paved",
    label: "Paved Fraction",
    category: "Land Cover & Built",
    filterGroup: "exposure",
    format: "score3",
    domainMin: 0,
    domainMax: 0.734375,
    displayScaleStrategy: "p05-p95",
    displayDomainMin: 0.10593,
    displayDomainMax: 0.574963,
    paletteId: "built",
    noDataPolicy: "transparent",
  },
  {
    id: "hardscape_frac",
    propertyKey: "hardscape_frac",
    label: "Hardscape Fraction",
    category: "Land Cover & Built",
    filterGroup: "exposure",
    format: "score3",
    domainMin: 0,
    domainMax: 1,
    displayScaleStrategy: "p05-p95",
    displayDomainMin: 0.154105,
    displayDomainMax: 0.913943,
    paletteId: "built",
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
