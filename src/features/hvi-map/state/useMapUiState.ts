import { useContext } from "react";
import { MapUiStateContext } from "./context";

export function useMapUiState() {
  const context = useContext(MapUiStateContext);
  if (!context) {
    throw new Error("useMapUiState must be used within MapStateProvider.");
  }
  return context;
}
