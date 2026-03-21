import { useMemo, useReducer, type ReactNode } from "react";
import { createInitialMapUiState, mapUiReducer } from "./reducer";
import {
  MapDispatchContext,
  MapHoverStateContext,
  MapUiStateContext,
} from "./context";

interface MapStateProviderProps {
  children: ReactNode;
}

export function MapStateProvider({ children }: MapStateProviderProps) {
  const [state, dispatch] = useReducer(mapUiReducer, undefined, createInitialMapUiState);

  const uiState = useMemo(
    () => ({
      zoomMode: state.zoomMode,
      lockedDa: state.lockedDa,
      lockedDaRegionName: state.lockedDaRegionName,
      lockedRegion: state.lockedRegion,
      selectedMetric: state.selectedMetric,
      filters: state.filters,
      isFilterMenuOpen: state.isFilterMenuOpen,
      showPeripheralAreas: state.showPeripheralAreas,
      mapError: state.mapError,
    }),
    [
      state.zoomMode,
      state.lockedDa,
      state.lockedDaRegionName,
      state.lockedRegion,
      state.selectedMetric,
      state.filters,
      state.isFilterMenuOpen,
      state.showPeripheralAreas,
      state.mapError,
    ]
  );

  const hoverState = useMemo(
    () => ({
      hoveredDa: state.hoveredDa,
      hoveredDaRegionName: state.hoveredDaRegionName,
      hoveredRegion: state.hoveredRegion,
    }),
    [state.hoveredDa, state.hoveredDaRegionName, state.hoveredRegion]
  );

  return (
    <MapDispatchContext.Provider value={dispatch}>
      <MapUiStateContext.Provider value={uiState}>
        <MapHoverStateContext.Provider value={hoverState}>
          {children}
        </MapHoverStateContext.Provider>
      </MapUiStateContext.Provider>
    </MapDispatchContext.Provider>
  );
}
