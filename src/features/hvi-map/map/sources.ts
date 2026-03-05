import { PMTILES_FILES } from "../config/regionConfig";

export interface PmtilesUrls {
  da: string;
  regions: string;
}

function ensureTrailingSlash(value: string): string {
  if (!value) return "/";
  return value.endsWith("/") ? value : `${value}/`;
}

export function getPmtilesUrls(baseUrl: string): PmtilesUrls {
  const base = ensureTrailingSlash(baseUrl);
  return {
    da: `${base}${PMTILES_FILES.da}`,
    regions: `${base}${PMTILES_FILES.regions}`,
  };
}
