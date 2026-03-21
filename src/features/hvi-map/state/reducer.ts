import {
  DA_METRIC_IDS,
  DA_METRICS_BY_ID,
  DEFAULT_DA_METRIC_ID,
  type DaMetricId,
} from "../config/daMetrics";
import { normalizeFilterRange } from "./filterRanges";
import type { RegionFeatureProperties } from "../types/data";
import type { DaFiltersState, MapAction, MapUiState } from "../types/state";

function createInitialFilters(): DaFiltersState {
  const filters = {} as DaFiltersState;
  for (const metricId of DA_METRIC_IDS) {
    const metricConfig = DA_METRICS_BY_ID[metricId];
    filters[metricId] = {
      min: metricConfig.domainMin,
      max: metricConfig.domainMax,
    };
  }
  return filters;
}

function getRegionKey(region: RegionFeatureProperties): string | number | null {
  if (typeof region.MunNum === "number") return region.MunNum;

  const name = region.FullName ?? region.ShortName;
  if (typeof name !== "string") return null;

  const trimmedName = name.trim();
  return trimmedName.length > 0 ? trimmedName : null;
}

export function createInitialMapUiState(): MapUiState {
  return {
    zoomMode: "region",
    hoveredDa: null,
    hoveredDaRegionName: null,
    lockedDa: null,
    lockedDaRegionName: null,
    hoveredRegion: null,
    lockedRegion: null,
    selectedMetric: DEFAULT_DA_METRIC_ID,
    filters: createInitialFilters(),
    isFilterMenuOpen: false,
    showPeripheralAreas: true,
    mapError: null,
  };
}

export function mapUiReducer(state: MapUiState, action: MapAction): MapUiState {
  switch (action.type) {
    case "zoomModeChanged": {
      if (action.zoomMode === state.zoomMode) return state;
      return {
        ...state,
        zoomMode: action.zoomMode,
        hoveredDa: null,
        hoveredDaRegionName: null,
        hoveredRegion: null,
      };
    }
    case "hoveredDaChanged": {
      if (state.lockedDa) return state;
      const nextRegionName = action.regionName ?? null;
      const currentDguid = state.hoveredDa?.DGUID ?? null;
      const nextDguid = action.da?.DGUID ?? null;
      if (
        currentDguid === nextDguid &&
        state.hoveredDaRegionName === nextRegionName
      ) {
        return state;
      }
      return {
        ...state,
        hoveredDa: action.da,
        hoveredDaRegionName: nextRegionName,
      };
    }
    case "daClicked": {
      const clickedId = action.da.DGUID;
      const lockedId = state.lockedDa?.DGUID ?? null;

      if (lockedId === clickedId) {
        return {
          ...state,
          lockedDa: null,
          lockedDaRegionName: null,
          hoveredDa: action.da,
          hoveredDaRegionName: action.regionName ?? null,
        };
      }

      return {
        ...state,
        lockedDa: action.da,
        lockedDaRegionName: action.regionName ?? null,
      };
    }
    case "unlockDa": {
      return { ...state, lockedDa: null, lockedDaRegionName: null };
    }
    case "hoveredRegionChanged": {
      if (state.lockedRegion) return state;
      const currentRegionKey = state.hoveredRegion
        ? getRegionKey(state.hoveredRegion)
        : null;
      const nextRegionKey = action.region ? getRegionKey(action.region) : null;
      if (currentRegionKey === nextRegionKey) {
        return state;
      }
      return { ...state, hoveredRegion: action.region };
    }
    case "regionClicked": {
      const clickedId = getRegionKey(action.region);
      const lockedId = state.lockedRegion ? getRegionKey(state.lockedRegion) : null;

      if (lockedId !== null && lockedId === clickedId) {
        return {
          ...state,
          lockedRegion: null,
          hoveredRegion: action.region,
        };
      }

      return {
        ...state,
        lockedRegion: action.region,
      };
    }
    case "unlockRegion": {
      return { ...state, lockedRegion: null };
    }
    case "selectedMetricChanged": {
      return { ...state, selectedMetric: action.metricId };
    }
    case "filterRangeChanged": {
      const normalized = normalizeFilterRange(
        action.metricId,
        action.min,
        action.max
      );

      return {
        ...state,
        filters: {
          ...state.filters,
          [action.metricId]: {
            min: normalized.min,
            max: normalized.max,
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
    case "peripheralVisibilityChanged": {
      return { ...state, showPeripheralAreas: action.showPeripheralAreas };
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
