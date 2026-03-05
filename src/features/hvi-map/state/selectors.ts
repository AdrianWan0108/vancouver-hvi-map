import { DA_METRIC_IDS, DA_METRICS_BY_ID } from "../config/daMetrics";
import type { DaFeatureProperties } from "../types/data";
import type { MapUiState, PanelMode } from "../types/state";
import { toNumber } from "../utils/format";

function valueMatchesRange(
  value: unknown,
  min: number | null,
  max: number | null
): boolean {
  const numeric = toNumber(value);
  if (numeric === null) return false;
  if (min !== null && numeric < min) return false;
  if (max !== null && numeric > max) return false;
  return true;
}

export function doesDaMatchFilters(
  da: DaFeatureProperties,
  state: MapUiState
): boolean {
  for (const metricId of DA_METRIC_IDS) {
    const filter = state.filters[metricId];
    if (!filter.enabled) continue;

    const metric = DA_METRICS_BY_ID[metricId];
    if (!valueMatchesRange(da[metric.propertyKey], filter.min, filter.max)) {
      return false;
    }
  }

  return true;
}

export function selectPanelMode(state: MapUiState): PanelMode {
  if (state.zoomMode === "region") return "info";
  if (state.lockedDa) return "locked";
  if (state.hoveredDa) return "hover";
  return "info";
}

export function selectActiveDa(state: MapUiState): DaFeatureProperties | null {
  if (state.zoomMode !== "da") return null;
  if (state.lockedDa) return state.lockedDa;
  return state.hoveredDa;
}

export function selectIsLockedDaFilteredOut(state: MapUiState): boolean {
  if (!state.lockedDa) return false;
  if (state.zoomMode !== "da") return false;
  return !doesDaMatchFilters(state.lockedDa, state);
}
