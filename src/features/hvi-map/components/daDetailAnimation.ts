import type { DaMetricFormatId } from "../config/daMetrics";
import { formatValueByFormat } from "../utils/format";

export const DETAIL_ROW_ANIMATION_DURATION_MS = 650;
export const DETAIL_ROW_ANIMATION_STAGGER_MS = 50;

function clamp01(value: number): number {
  if (value <= 0) return 0;
  if (value >= 1) return 1;
  return value;
}

export function easeOutCubic(value: number): number {
  const clamped = clamp01(value);
  return 1 - (1 - clamped) ** 3;
}

export function getDetailRowAnimationProgress({
  elapsedMs,
  delayMs,
  durationMs = DETAIL_ROW_ANIMATION_DURATION_MS,
  reducedMotion = false,
}: {
  elapsedMs: number;
  delayMs: number;
  durationMs?: number;
  reducedMotion?: boolean;
}): number {
  if (reducedMotion) return 1;
  if (elapsedMs <= delayMs) return 0;

  return easeOutCubic((elapsedMs - delayMs) / durationMs);
}

export function formatAnimatedMetricValue({
  format,
  numericValue,
  progress,
  fallbackValue,
}: {
  format: DaMetricFormatId;
  numericValue: number | null;
  progress: number;
  fallbackValue: string;
}): string {
  if (numericValue === null) {
    return fallbackValue;
  }

  const clampedProgress = clamp01(progress);
  if (clampedProgress >= 1) {
    return formatValueByFormat(format, numericValue);
  }

  const animatedValue = numericValue * clampedProgress;
  const displayValue = format === "integer" ? Math.round(animatedValue) : animatedValue;
  return formatValueByFormat(format, displayValue);
}
