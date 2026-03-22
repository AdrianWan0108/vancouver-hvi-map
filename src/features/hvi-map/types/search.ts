import type { DaFeatureProperties, RegionFeatureProperties } from "./data";

export type SearchBounds = [number, number, number, number];
export type SearchCenter = [number, number];

interface SearchEntryBase {
  key: string;
  label: string;
  secondaryLabel: string | null;
  bbox: SearchBounds;
  center: SearchCenter;
}

export interface DaSearchEntry extends SearchEntryBase {
  kind: "da";
  properties: DaFeatureProperties;
  regionName: string | null;
}

export interface RegionSearchEntry extends SearchEntryBase {
  kind: "region";
  properties: RegionFeatureProperties;
}

export type SearchEntry = DaSearchEntry | RegionSearchEntry;
export interface AddressSearchResult extends SearchEntryBase {
  kind: "address";
  source: "bc-geocoder";
}

export type SearchResult = SearchEntry | AddressSearchResult;

export interface SearchIndex {
  version: number;
  generatedAt: string;
  entries: SearchEntry[];
}
