import { createContext, type Dispatch } from "react";
import type { MapAction, MapUiState } from "../types/state";

export interface MapStateContextValue {
  state: MapUiState;
  dispatch: Dispatch<MapAction>;
}

export const MapStateContext = createContext<MapStateContextValue | undefined>(
  undefined
);
