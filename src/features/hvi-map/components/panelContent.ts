import type { ZoomMode } from "../types/data";

interface PanelHeaderContent {
  title: string;
  subtitle: string | null;
}

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

export function getPanelHeaderContent({
  zoomMode,
  activeDaDguid,
  activeDaRegionName,
  activeRegionName,
}: {
  zoomMode: ZoomMode;
  activeDaDguid: string | null;
  activeDaRegionName: string | null;
  activeRegionName: string | null;
}): PanelHeaderContent {
  if (zoomMode === "da") {
    if (activeDaDguid) {
      return {
        title: `DA ${activeDaDguid}`,
        subtitle: activeDaRegionName,
      };
    }

    return {
      title: "DA Details",
      subtitle: null,
    };
  }

  if (activeRegionName) {
    return {
      title: activeRegionName,
      subtitle: null,
    };
  }

  return {
    title: "Regional Summary",
    subtitle: null,
  };
}
