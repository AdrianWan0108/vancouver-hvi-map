import type { ExpressionSpecification } from "@maplibre/maplibre-gl-style-spec";
import type { DaMetricConfig, DaMetricId, MetricPaletteId } from "../config/daMetrics";
import { getPaletteStops } from "../config/palettes";
import type { DaFiltersState } from "../types/state";

export type MapExpression = boolean | ExpressionSpecification;

type FillMetricConfig = {
  propertyKey: string;
  domainMin: number;
  domainMax: number;
  paletteId: MetricPaletteId;
};

type VisibilityMetricConfig = {
  propertyKey: string;
  noDataPolicy: DaMetricConfig["noDataPolicy"];
};

function buildClampedValueExpression(
  propertyKey: string,
  domainMin: number,
  domainMax: number
): ExpressionSpecification {
  return [
    "max",
    domainMin,
    [
      "min",
      domainMax,
      ["coalesce", ["to-number", ["get", propertyKey]], domainMin],
    ],
  ] as ExpressionSpecification;
}

function buildPaletteExpression({
  propertyKey,
  domainMin,
  domainMax,
  paletteId,
}: FillMetricConfig): ExpressionSpecification {
  const midpoint = domainMin + (domainMax - domainMin) / 2;
  const [lowColor, midColor, highColor] = getPaletteStops(paletteId);

  return [
    "interpolate",
    ["linear"],
    buildClampedValueExpression(propertyKey, domainMin, domainMax),
    domainMin,
    lowColor,
    midpoint,
    midColor,
    domainMax,
    highColor,
  ] as ExpressionSpecification;
}

export function buildFillColorExpression(
  metric: FillMetricConfig
): ExpressionSpecification {
  return buildPaletteExpression(metric);
}

export function buildRegionVisibilityFilterExpression(
  showPeripheralAreas: boolean,
  populationThreshold: number
): MapExpression {
  if (showPeripheralAreas) return true;

  return [
    "all",
    ["has", "region_pop_total"],
    [">=", ["to-number", ["get", "region_pop_total"]], populationThreshold],
  ] as ExpressionSpecification;
}

type FilterMetricLookup = Record<DaMetricId, Pick<DaMetricConfig, "propertyKey">>;

export function buildFilterExpression(
  filters: DaFiltersState,
  metricsById: FilterMetricLookup
): MapExpression {
  const metricIds = Object.keys(filters) as DaMetricId[];
  const clauses: unknown[][] = [];

  for (const metricId of metricIds) {
    const filter = filters[metricId];
    if (!filter.enabled) continue;

    const metric = metricsById[metricId];
    const propertyKey = String(metric.propertyKey);
    const valueExpression: unknown[] = ["to-number", ["get", propertyKey]];
    const checks: unknown[][] = [["has", propertyKey]];

    if (filter.min !== null) {
      checks.push([">=", valueExpression, filter.min]);
    }
    if (filter.max !== null) {
      checks.push(["<=", valueExpression, filter.max]);
    }

    if (checks.length === 1 && filter.min === null && filter.max === null) {
      continue;
    }

    clauses.push(["all", ...checks]);
  }

  if (clauses.length === 0) return true;
  if (clauses.length === 1) return clauses[0] as ExpressionSpecification;
  return ["all", ...clauses] as ExpressionSpecification;
}

function buildMetricVisibilityExpression(
  metric: VisibilityMetricConfig,
  filterExpression: MapExpression
): MapExpression {
  const clauses: unknown[] = [];

  if (metric.noDataPolicy === "transparent") {
    clauses.push(["has", metric.propertyKey]);
  }

  if (filterExpression !== true) {
    clauses.push(filterExpression);
  }

  if (clauses.length === 0) return true;
  if (clauses.length === 1) return clauses[0] as ExpressionSpecification;
  return ["all", ...clauses] as ExpressionSpecification;
}

export function buildDaFillOpacityExpression(
  metric: VisibilityMetricConfig,
  filterExpression: MapExpression
): ExpressionSpecification {
  return [
    "case",
    buildMetricVisibilityExpression(metric, filterExpression),
    ["case", ["boolean", ["feature-state", "hover"], false], 0.92, 0.75],
    0,
  ] as ExpressionSpecification;
}

export function buildLineWidthExpression(
  hoveredWidth: number,
  defaultWidth: number
): ExpressionSpecification {
  return [
    "case",
    ["boolean", ["feature-state", "hover"], false],
    hoveredWidth,
    defaultWidth,
  ] as ExpressionSpecification;
}
