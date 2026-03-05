import type { DaMetricId } from "../config/daMetrics";
import type { DaFeatureProperties, ZoomMode } from "./data";

export interface DaFilterRange {
  min: number | null;
  max: number | null;
  enabled: boolean;
}

export type DaFiltersState = Record<DaMetricId, DaFilterRange>;

export interface MapUiState {
  zoomMode: ZoomMode;
  hoveredDa: DaFeatureProperties | null;
  lockedDa: DaFeatureProperties | null;
  selectedMetric: DaMetricId;
  filters: DaFiltersState;
  isFilterMenuOpen: boolean;
  mapError: string | null;
}

export type MapAction =
  | { type: "zoomModeChanged"; zoomMode: ZoomMode }
  | { type: "hoveredDaChanged"; da: DaFeatureProperties | null }
  | { type: "daClicked"; da: DaFeatureProperties }
  | { type: "unlockDa" }
  | { type: "selectedMetricChanged"; metricId: DaMetricId }
  | {
      type: "filterRangeChanged";
      metricId: DaMetricId;
      min: number | null;
      max: number | null;
      enabled?: boolean;
    }
  | { type: "filterEnabledChanged"; metricId: DaMetricId; enabled: boolean }
  | { type: "filtersReset" }
  | { type: "filterMenuOpenChanged"; isOpen: boolean }
  | { type: "mapErrorChanged"; message: string | null };

export type PanelMode = "info" | "hover" | "locked";
