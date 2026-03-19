import type { RegionFeatureProperties } from "../types/data";

export function getRegionDisplayName(
  region: RegionFeatureProperties | null | undefined
): string | null {
  const name = region?.FullName ?? region?.ShortName;
  if (typeof name !== "string") return null;

  const trimmed = name.trim();
  return trimmed.length > 0 ? trimmed : null;
}
