import { useContext } from "react";
import { MapHoverStateContext } from "./context";

export function useMapHoverState() {
  const context = useContext(MapHoverStateContext);
  if (!context) {
    throw new Error("useMapHoverState must be used within MapStateProvider.");
  }
  return context;
}
