import type { ZoomMode } from "../types/data";
import type { RegionFeatureProperties } from "../types/data";
import type { PanelMode } from "../types/state";
import { formatInteger } from "../utils/format";
import { getRegionDisplayName } from "../utils/region";

export interface SelectedPlaceContent {
  eyebrow: string;
  title: string;
  subtitle: string | null;
  meta: string | null;
}

export function shouldShowDaControls(zoomMode: ZoomMode): boolean {
  return zoomMode === "da";
}

export function shouldShowInfoModeContent({
  zoomMode,
  panelMode,
  hasActiveDa,
  hasActiveRegion,
}: {
  zoomMode: ZoomMode;
  panelMode: PanelMode;
  hasActiveDa: boolean;
  hasActiveRegion: boolean;
}): boolean {
  if (zoomMode === "da") {
    return panelMode === "info" || !hasActiveDa;
  }

  return panelMode === "info" || !hasActiveRegion;
}

export function getDaSelectedPlaceContent({
  activeDaDauid,
  activeDaRegionName,
  activeDaPopulation,
}: {
  activeDaDauid: string | null;
  activeDaRegionName: string | null;
  activeDaPopulation: number | null;
}): SelectedPlaceContent | null {
  if (!activeDaDauid) {
    return null;
  }

  return {
    eyebrow: "Selected dissemination area",
    title: `Dissemination Area ${activeDaDauid}`,
    subtitle: activeDaRegionName,
    meta:
      activeDaPopulation === null
        ? null
        : `Population: ${formatInteger(activeDaPopulation)}`,
  };
}

export function getRegionSelectedPlaceContent(
  region: RegionFeatureProperties | null
): SelectedPlaceContent | null {
  const regionName = getRegionDisplayName(region);
  if (!regionName) {
    return null;
  }

  return {
    eyebrow: "Selected region",
    title: regionName,
    subtitle:
      typeof region?.MunNum === "number" ? `Region ${region.MunNum}` : null,
    meta:
      typeof region?.region_pop_total === "number"
        ? `Population: ${formatInteger(region.region_pop_total)}`
        : null,
  };
}
