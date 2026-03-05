import { useMemo, useReducer, type ReactNode } from "react";
import { createInitialMapUiState, mapUiReducer } from "./reducer";
import { MapStateContext } from "./context";

interface MapStateProviderProps {
  children: ReactNode;
}

export function MapStateProvider({ children }: MapStateProviderProps) {
  const [state, dispatch] = useReducer(mapUiReducer, undefined, createInitialMapUiState);

  const value = useMemo(
    () => ({
      state,
      dispatch,
    }),
    [state]
  );

  return <MapStateContext.Provider value={value}>{children}</MapStateContext.Provider>;
}
