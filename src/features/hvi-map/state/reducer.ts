import {
  DA_METRIC_IDS,
  DA_METRICS_BY_ID,
  DEFAULT_DA_METRIC_ID,
  type DaMetricId,
} from "../config/daMetrics";
import type { MapAction, MapUiState, DaFiltersState } from "../types/state";

function createInitialFilters(): DaFiltersState {
  const filters = {} as DaFiltersState;
  for (const metricId of DA_METRIC_IDS) {
    const metricConfig = DA_METRICS_BY_ID[metricId];
    filters[metricId] = {
      min: metricConfig.defaultMin,
      max: metricConfig.defaultMax,
      enabled: false,
    };
  }
  return filters;
}

function normalizeRange(
  min: number | null,
  max: number | null
): { min: number | null; max: number | null } {
  if (min === null || max === null) {
    return { min, max };
  }
  if (min <= max) {
    return { min, max };
  }
  return { min: max, max: min };
}

export function createInitialMapUiState(): MapUiState {
  return {
    zoomMode: "region",
    hoveredDa: null,
    lockedDa: null,
    selectedMetric: DEFAULT_DA_METRIC_ID,
    filters: createInitialFilters(),
    isFilterMenuOpen: false,
    mapError: null,
  };
}

export function mapUiReducer(state: MapUiState, action: MapAction): MapUiState {
  switch (action.type) {
    case "zoomModeChanged": {
      if (action.zoomMode === state.zoomMode) return state;
      if (action.zoomMode === "region") {
        return { ...state, zoomMode: action.zoomMode, hoveredDa: null };
      }
      return { ...state, zoomMode: action.zoomMode };
    }
    case "hoveredDaChanged": {
      if (state.lockedDa) return state;
      return { ...state, hoveredDa: action.da };
    }
    case "daClicked": {
      const clickedId = action.da.DGUID;
      const lockedId = state.lockedDa?.DGUID ?? null;

      if (lockedId === clickedId) {
        return {
          ...state,
          lockedDa: null,
          hoveredDa: action.da,
        };
      }

      return {
        ...state,
        lockedDa: action.da,
      };
    }
    case "unlockDa": {
      return { ...state, lockedDa: null };
    }
    case "selectedMetricChanged": {
      return { ...state, selectedMetric: action.metricId };
    }
    case "filterRangeChanged": {
      const normalized = normalizeRange(action.min, action.max);
      const hasBounds = normalized.min !== null || normalized.max !== null;
      const nextEnabled = action.enabled ?? hasBounds;

      return {
        ...state,
        filters: {
          ...state.filters,
          [action.metricId]: {
            min: normalized.min,
            max: normalized.max,
            enabled: nextEnabled,
          },
        },
      };
    }
    case "filterEnabledChanged": {
      const current = state.filters[action.metricId];
      return {
        ...state,
        filters: {
          ...state.filters,
          [action.metricId]: {
            ...current,
            enabled: action.enabled,
          },
        },
      };
    }
    case "filtersReset": {
      return {
        ...state,
        filters: createInitialFilters(),
      };
    }
    case "filterMenuOpenChanged": {
      return { ...state, isFilterMenuOpen: action.isOpen };
    }
    case "mapErrorChanged": {
      return { ...state, mapError: action.message };
    }
    default: {
      const exhaustiveCheck: never = action;
      return exhaustiveCheck;
    }
  }
}

export function isValidMetricId(metricId: string): metricId is DaMetricId {
  return DA_METRIC_IDS.includes(metricId as DaMetricId);
}
