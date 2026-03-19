import type { ZoomMode } from "../types/data";

export function shouldShowDaControls(zoomMode: ZoomMode): boolean {
  return zoomMode === "da";
}

export function shouldShowViewOptions(zoomMode: ZoomMode): boolean {
  return zoomMode === "region";
}

export function isPeripheralVisibilityControlDisabled(
  zoomMode: ZoomMode
): boolean {
  return zoomMode !== "region";
}

export function getPeripheralVisibilityDescription(zoomMode: ZoomMode): string {
  if (zoomMode === "region") {
    return "Regions with population below 5,000 stay visible when this is enabled.";
  }

  return "Region view only. DA filters stay in the filter section below.";
}
