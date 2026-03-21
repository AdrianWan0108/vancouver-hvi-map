import { useMemo } from "react";
import { useMapDispatch } from "./useMapDispatch";
import { useMapHoverState } from "./useMapHoverState";
import { useMapUiState } from "./useMapUiState";
import type { MapUiState } from "../types/state";

export function useMapState() {
  const uiState = useMapUiState();
  const hoverState = useMapHoverState();
  const dispatch = useMapDispatch();

  return useMemo(
    () => ({
      state: {
        ...uiState,
        ...hoverState,
      } as MapUiState,
      dispatch,
    }),
    [dispatch, hoverState, uiState]
  );
}
