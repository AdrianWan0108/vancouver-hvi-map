import type { DaMetricId } from "../config/daMetrics";
import type {
  DaFeatureProperties,
  RegionFeatureProperties,
  ZoomMode,
} from "./data";

export interface DaFilterRange {
  min: number;
  max: number;
}

export type DaFiltersState = Record<DaMetricId, DaFilterRange>;

export interface MapUiState {
  zoomMode: ZoomMode;
  hoveredDa: DaFeatureProperties | null;
  hoveredDaRegionName: string | null;
  lockedDa: DaFeatureProperties | null;
  lockedDaRegionName: string | null;
  hoveredRegion: RegionFeatureProperties | null;
  lockedRegion: RegionFeatureProperties | null;
  selectedMetric: DaMetricId;
  filters: DaFiltersState;
  isFilterMenuOpen: boolean;
  showPeripheralAreas: boolean;
  mapError: string | null;
}

export type MapAction =
  | { type: "zoomModeChanged"; zoomMode: ZoomMode }
  | {
      type: "hoveredDaChanged";
      da: DaFeatureProperties | null;
      regionName?: string | null;
    }
  | { type: "daClicked"; da: DaFeatureProperties; regionName?: string | null }
  | { type: "unlockDa" }
  | { type: "hoveredRegionChanged"; region: RegionFeatureProperties | null }
  | { type: "regionClicked"; region: RegionFeatureProperties }
  | { type: "unlockRegion" }
  | { type: "selectedMetricChanged"; metricId: DaMetricId }
  | {
      type: "filterRangeChanged";
      metricId: DaMetricId;
      min: number;
      max: number;
    }
  | { type: "filtersReset" }
  | { type: "filterMenuOpenChanged"; isOpen: boolean }
  | { type: "peripheralVisibilityChanged"; showPeripheralAreas: boolean }
  | { type: "mapErrorChanged"; message: string | null };

export type PanelMode = "info" | "hover" | "locked";
