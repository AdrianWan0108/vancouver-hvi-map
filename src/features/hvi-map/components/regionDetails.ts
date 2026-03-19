import type { RegionFeatureProperties } from "../types/data";
import { formatInteger, formatScore } from "../utils/format";

export interface RegionDetailsRow {
  label: string;
  value: string;
}

export function getRegionDetailsRows(
  region: RegionFeatureProperties
): RegionDetailsRow[] {
  return [
    {
      label: "Regional HVI",
      value: formatScore(region.region_hvi_n01),
    },
    {
      label: "Population",
      value: formatInteger(region.region_pop_total),
    },
    {
      label: "DAs Used",
      value: formatInteger(region.da_count_used),
    },
  ];
}
