import { useContext } from "react";
import { MapDispatchContext } from "./context";

export function useMapDispatch() {
  const context = useContext(MapDispatchContext);
  if (!context) {
    throw new Error("useMapDispatch must be used within MapStateProvider.");
  }
  return context;
}
