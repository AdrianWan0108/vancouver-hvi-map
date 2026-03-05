import type { DaMetricConfig } from "../config/daMetrics";

export function toNumber(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim() !== "") {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) return parsed;
  }
  return null;
}

export function toText(value: unknown): string {
  if (value === null || value === undefined) return "";
  return String(value);
}

export function formatScore(value: unknown): string {
  const numeric = toNumber(value);
  if (numeric === null) return "N/A";
  return numeric.toFixed(3);
}

export function formatInteger(value: unknown): string {
  const numeric = toNumber(value);
  if (numeric === null) return "N/A";
  return numeric.toLocaleString();
}

export function formatNumber2(value: unknown): string {
  const numeric = toNumber(value);
  if (numeric === null) return "N/A";
  return numeric.toFixed(2);
}

export function formatPercent1(value: unknown): string {
  const numeric = toNumber(value);
  if (numeric === null) return "N/A";
  return `${numeric.toFixed(1)}%`;
}

export function formatMetricValue(metric: DaMetricConfig, value: unknown): string {
  switch (metric.format) {
    case "score3":
      return formatScore(value);
    case "integer":
      return formatInteger(value);
    case "number2":
      return formatNumber2(value);
    case "percent1":
      return formatPercent1(value);
    default:
      return toText(value);
  }
}

export function parseNumericInput(raw: string): number | null {
  const trimmed = raw.trim();
  if (trimmed.length === 0) return null;
  const parsed = Number(trimmed);
  if (!Number.isFinite(parsed)) return null;
  return parsed;
}
