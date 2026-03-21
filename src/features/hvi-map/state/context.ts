import { createContext, type Dispatch } from "react";
import type { MapAction, MapUiState } from "../types/state";

export type MapUiStateSlice = Pick<
  MapUiState,
  | "zoomMode"
  | "lockedDa"
  | "lockedDaRegionName"
  | "lockedRegion"
  | "selectedMetric"
  | "filters"
  | "isFilterMenuOpen"
  | "showPeripheralAreas"
  | "mapError"
>;

export type MapHoverStateSlice = Pick<
  MapUiState,
  "hoveredDa" | "hoveredDaRegionName" | "hoveredRegion"
>;

export const MapUiStateContext = createContext<MapUiStateSlice | undefined>(
  undefined
);

export const MapHoverStateContext = createContext<MapHoverStateSlice | undefined>(
  undefined
);

export const MapDispatchContext = createContext<Dispatch<MapAction> | undefined>(
  undefined
);
