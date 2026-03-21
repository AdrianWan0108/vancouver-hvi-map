import {
  DA_METRICS_BY_ID,
  type DaMetricFormatId,
  type DaMetricId,
} from "../config/daMetrics";
import type { DaFilterRange } from "../types/state";

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

export function normalizeFilterRange(
  metricId: DaMetricId,
  min: number,
  max: number
): DaFilterRange {
  const metric = DA_METRICS_BY_ID[metricId];
  const nextMin = clamp(min, metric.domainMin, metric.domainMax);
  const nextMax = clamp(max, metric.domainMin, metric.domainMax);

  if (nextMin <= nextMax) {
    return { min: nextMin, max: nextMax };
  }

  return { min: nextMax, max: nextMin };
}

export function isFilterRangeActive(
  metricId: DaMetricId,
  range: DaFilterRange
): boolean {
  const metric = DA_METRICS_BY_ID[metricId];
  return range.min > metric.domainMin || range.max < metric.domainMax;
}

export function getFilterInputStep(format: DaMetricFormatId): number {
  switch (format) {
    case "integer":
      return 1;
    case "percent1":
      return 0.1;
    case "number2":
      return 0.01;
    case "score3":
      return 0.001;
    default:
      return 0.001;
  }
}

function trimTrailingZeros(value: string): string {
  return value.replace(/\.?0+$/, "");
}

export function formatFilterInputValue(
  value: number,
  format: DaMetricFormatId
): string {
  switch (format) {
    case "integer":
      return String(Math.round(value));
    case "percent1":
      return trimTrailingZeros(value.toFixed(1));
    case "number2":
      return trimTrailingZeros(value.toFixed(2));
    case "score3":
      return trimTrailingZeros(value.toFixed(3));
    default:
      return String(value);
  }
}
