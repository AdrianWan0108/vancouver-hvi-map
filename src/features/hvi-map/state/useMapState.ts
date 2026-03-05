import { useContext } from "react";
import { MapStateContext } from "./context";

export function useMapState() {
  const context = useContext(MapStateContext);
  if (!context) {
    throw new Error("useMapState must be used within MapStateProvider.");
  }
  return context;
}
