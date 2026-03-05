import type { DaMetricConfig, DaMetricId, DaMetricPaletteId } from "../config/daMetrics";
import type { DaFiltersState } from "../types/state";
import type { ExpressionSpecification } from "@maplibre/maplibre-gl-style-spec";

export type MapExpression = boolean | ExpressionSpecification;

function buildPaletteExpression(
  propertyKey: string,
  paletteId: DaMetricPaletteId
): ExpressionSpecification {
  if (paletteId === "orange-green") {
    return [
      "interpolate",
      ["linear"],
      ["coalesce", ["to-number", ["get", propertyKey]], 0],
      0,
      "#fdae61",
      0.5,
      "#fee08b",
      1,
      "#1a9850",
    ] as ExpressionSpecification;
  }

  return [
    "interpolate",
    ["linear"],
    ["coalesce", ["to-number", ["get", propertyKey]], 0],
    0,
    "#fdae61",
    0.5,
    "#fee08b",
    1,
    "#1a9850",
  ] as ExpressionSpecification;
}

export function buildFillColorExpression(
  metric: { propertyKey: string; paletteId: DaMetricPaletteId }
): ExpressionSpecification {
  return buildPaletteExpression(metric.propertyKey, metric.paletteId);
}

type FilterMetricLookup = Record<
  DaMetricId,
  Pick<DaMetricConfig, "propertyKey" | "noDataPolicy">
>;

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

export function buildDaFillOpacityExpression(
  filterExpression: MapExpression
): ExpressionSpecification {
  return [
    "case",
    filterExpression,
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
