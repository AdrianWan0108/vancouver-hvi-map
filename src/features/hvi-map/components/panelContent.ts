import type { ZoomMode } from "../types/data";

interface PanelHeaderContent {
  title: string;
  subtitle: string | null;
}

export function shouldShowDaControls(zoomMode: ZoomMode): boolean {
  return zoomMode === "da";
}

export function getPanelHeaderContent({
  zoomMode,
  activeDaDauid,
  activeDaRegionName,
  activeRegionName,
}: {
  zoomMode: ZoomMode;
  activeDaDauid: string | null;
  activeDaRegionName: string | null;
  activeRegionName: string | null;
}): PanelHeaderContent {
  if (zoomMode === "da") {
    if (activeDaDauid) {
      return {
        title: `DA ${activeDaDauid}`,
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
