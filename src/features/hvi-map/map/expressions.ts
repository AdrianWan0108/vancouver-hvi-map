import type { ExpressionSpecification } from "@maplibre/maplibre-gl-style-spec";
import type { DaMetricConfig, DaMetricId, MetricPaletteId } from "../config/daMetrics";
import { isFilterRangeActive } from "../state/filterRanges";
import { getPaletteStops } from "../config/palettes";
import type { DaFiltersState } from "../types/state";

export type MapExpression = boolean | ExpressionSpecification;

type FillMetricConfig = {
  propertyKey: string;
  displayDomainMin: number;
  displayDomainMax: number;
  paletteId: MetricPaletteId;
};

type VisibilityMetricConfig = {
  propertyKey: string;
  noDataPolicy: DaMetricConfig["noDataPolicy"];
};

export const DA_ZOOM_REGION_DIVIDER_STYLE = {
  color: "rgba(15, 23, 42, 0.45)",
  width: 1.6,
  opacity: 0.45,
} as const;

export const DA_ZOOM_REGION_DIVIDER_CASING_STYLE = {
  color: "rgba(255, 248, 236, 0.96)",
  width: 4.6,
  opacity: 0.96,
} as const;

export const LOCKED_DA_OUTLINE_STYLE = {
  color: "rgba(15, 23, 42, 0.95)",
  width: 3,
  opacity: 0.95,
} as const;

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
  displayDomainMin,
  displayDomainMax,
  paletteId,
}: FillMetricConfig): ExpressionSpecification {
  const midpoint =
    displayDomainMin + (displayDomainMax - displayDomainMin) / 2;
  const [lowColor, midColor, highColor] = getPaletteStops(paletteId);

  return [
    "interpolate",
    ["linear"],
    buildClampedValueExpression(propertyKey, displayDomainMin, displayDomainMax),
    displayDomainMin,
    lowColor,
    midpoint,
    midColor,
    displayDomainMax,
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

export function buildLockedFeatureFilterExpression(
  propertyKey: string,
  featureId: string | number | null
): ExpressionSpecification {
  const noMatchValue = "__map_no_locked_feature__";

  return [
    "all",
    ["has", propertyKey],
    [
      "==",
      ["get", propertyKey],
      featureId === null ? noMatchValue : String(featureId),
    ],
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
    if (!isFilterRangeActive(metricId, filter)) continue;

    const metric = metricsById[metricId];
    const propertyKey = String(metric.propertyKey);
    const valueExpression: unknown[] = ["to-number", ["get", propertyKey]];
    const checks: unknown[][] = [["has", propertyKey]];

    checks.push([">=", valueExpression, filter.min]);
    checks.push(["<=", valueExpression, filter.max]);

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
