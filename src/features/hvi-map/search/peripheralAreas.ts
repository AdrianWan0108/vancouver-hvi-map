import {
  PERIPHERAL_REGION_MANUAL_EXCLUDE_KEYS,
  PERIPHERAL_REGION_MANUAL_INCLUDE_KEYS,
  PERIPHERAL_REGION_POPULATION_THRESHOLD,
} from "../config/regionConfig";
import type { RegionFeatureProperties } from "../types/data";
import type { SearchEntry, SearchIndex } from "../types/search";
import { loadSearchIndex } from "./index";

export interface PeripheralAreaMetadata {
  peripheralRegionKeys: string[];
  peripheralRegionNames: string[];
  peripheralDaDguids: string[];
}

type RegionIdentity = Pick<
  RegionFeatureProperties,
  "MunNum" | "FullName" | "ShortName" | "region_pop_total"
>;

const manualIncludeKeys = new Set(
  PERIPHERAL_REGION_MANUAL_INCLUDE_KEYS.map((key) => String(key))
);
const manualExcludeKeys = new Set(
  PERIPHERAL_REGION_MANUAL_EXCLUDE_KEYS.map((key) => String(key))
);

let cachedPeripheralAreaMetadataPromise: Promise<PeripheralAreaMetadata> | null =
  null;

const NON_PERIPHERAL_NULL_REGION_DA_BBOXES = [
  {
    minLon: -123.27,
    minLat: 49.24,
    maxLon: -123.19,
    maxLat: 49.275,
  },
] as const;

function normalizeRegionName(name: string): string {
  return name.trim().toLowerCase();
}

function isWithinBoundingBox(
  coordinates: readonly [number, number] | readonly number[]
): boolean {
  const [lon, lat] = coordinates;
  return NON_PERIPHERAL_NULL_REGION_DA_BBOXES.some(
    (bbox) =>
      lon >= bbox.minLon &&
      lon <= bbox.maxLon &&
      lat >= bbox.minLat &&
      lat <= bbox.maxLat
  );
}

export function getRegionKey(
  region: Pick<RegionIdentity, "MunNum" | "FullName" | "ShortName"> | null | undefined
): string | null {
  if (!region) return null;

  if (typeof region.MunNum === "number") {
    return String(region.MunNum);
  }

  const name = region.FullName ?? region.ShortName;
  if (typeof name !== "string") return null;

  const trimmedName = name.trim();
  return trimmedName.length > 0 ? trimmedName : null;
}

export function isPeripheralRegion(
  region: RegionIdentity | null | undefined
): boolean {
  if (!region) return false;

  const regionKey = getRegionKey(region);
  if (regionKey && manualExcludeKeys.has(regionKey)) {
    return false;
  }

  if (regionKey && manualIncludeKeys.has(regionKey)) {
    return true;
  }

  if (typeof region.region_pop_total !== "number") {
    return false;
  }

  return region.region_pop_total < PERIPHERAL_REGION_POPULATION_THRESHOLD;
}

export function derivePeripheralAreaMetadata(
  searchIndex: SearchIndex
): PeripheralAreaMetadata {
  const peripheralRegionKeys = new Set<string>();
  const peripheralRegionNames = new Set<string>();

  for (const entry of searchIndex.entries) {
    if (entry.kind !== "region") continue;
    if (!isPeripheralRegion(entry.properties)) continue;

    const regionKey = getRegionKey(entry.properties);
    if (regionKey) {
      peripheralRegionKeys.add(regionKey);
    }

    peripheralRegionNames.add(normalizeRegionName(entry.label));
    if (entry.secondaryLabel) {
      peripheralRegionNames.add(normalizeRegionName(entry.secondaryLabel));
    }
    if (entry.properties.FullName) {
      peripheralRegionNames.add(normalizeRegionName(entry.properties.FullName));
    }
    if (entry.properties.ShortName) {
      peripheralRegionNames.add(normalizeRegionName(entry.properties.ShortName));
    }
  }

  const peripheralDaDguids = new Set<string>();

  for (const entry of searchIndex.entries) {
    if (entry.kind !== "da") continue;

    if (!entry.regionName) {
      if (!isWithinBoundingBox(entry.center)) {
        peripheralDaDguids.add(entry.properties.DGUID);
      }
      continue;
    }

    if (!peripheralRegionNames.has(normalizeRegionName(entry.regionName))) {
      continue;
    }

    peripheralDaDguids.add(entry.properties.DGUID);
  }

  return {
    peripheralRegionKeys: [...peripheralRegionKeys].sort(),
    peripheralRegionNames: [...peripheralRegionNames].sort(),
    peripheralDaDguids: [...peripheralDaDguids].sort(),
  };
}

export function loadPeripheralAreaMetadata(): Promise<PeripheralAreaMetadata> {
  if (cachedPeripheralAreaMetadataPromise) {
    return cachedPeripheralAreaMetadataPromise;
  }

  cachedPeripheralAreaMetadataPromise = loadSearchIndex().then(
    derivePeripheralAreaMetadata
  );

  return cachedPeripheralAreaMetadataPromise;
}

export function isPeripheralSearchEntry(
  entry: SearchEntry,
  metadata: PeripheralAreaMetadata
): boolean {
  if (entry.kind === "region") {
    const regionKey = getRegionKey(entry.properties);
    return regionKey ? metadata.peripheralRegionKeys.includes(regionKey) : false;
  }

  return metadata.peripheralDaDguids.includes(entry.properties.DGUID);
}
