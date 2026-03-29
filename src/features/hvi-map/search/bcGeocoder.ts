import { METRO_VANCOUVER_SEARCH_BOUNDS } from "../config/regionConfig";
import type { AddressSearchResult, SearchBounds, SearchCenter } from "../types/search";

const BC_GEOCODER_URL = "https://geocoder.api.gov.bc.ca/addresses.geojson";
export const BC_GEOCODER_MIN_QUERY_LENGTH = 3;
export const BC_GEOCODER_DEFAULT_LIMIT = 5;
export const METRO_VANCOUVER_SEARCH_BBOX: SearchBounds =
  METRO_VANCOUVER_SEARCH_BOUNDS;

interface BcGeocoderFeatureCollection {
  features?: BcGeocoderFeature[];
}

interface BcGeocoderFeature {
  geometry?: {
    coordinates?: [number, number];
  };
  properties?: {
    fullAddress?: string;
    addressString?: string;
    localityName?: string;
    provinceCode?: string;
    siteID?: string | number;
  };
}

interface SearchBcAddressGeocoderOptions {
  signal?: AbortSignal;
  limit?: number;
  bbox?: SearchBounds;
}

function isFiniteCoordinate(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

function toAddressSearchResult(feature: BcGeocoderFeature): AddressSearchResult | null {
  const coordinates = feature.geometry?.coordinates;
  const longitude = coordinates?.[0];
  const latitude = coordinates?.[1];
  if (!isFiniteCoordinate(longitude) || !isFiniteCoordinate(latitude)) {
    return null;
  }

  const properties = feature.properties ?? {};
  const label = properties.fullAddress?.trim() || properties.addressString?.trim();
  if (!label) {
    return null;
  }

  const secondaryParts = [properties.localityName, properties.provinceCode]
    .filter((value): value is string => typeof value === "string" && value.trim().length > 0)
    .map((value) => value.trim());
  const secondaryLabel =
    secondaryParts.length > 0 ? Array.from(new Set(secondaryParts)).join(", ") : null;

  const center: SearchCenter = [longitude, latitude];
  const bbox: SearchBounds = [longitude, latitude, longitude, latitude];

  return {
    kind: "address",
    source: "bc-geocoder",
    key: `bc-address:${properties.siteID ?? `${longitude},${latitude}:${label}`}`,
    label,
    secondaryLabel,
    center,
    bbox,
  };
}

export async function searchBcAddressGeocoder(
  query: string,
  {
    signal,
    limit = BC_GEOCODER_DEFAULT_LIMIT,
    bbox = METRO_VANCOUVER_SEARCH_BBOX,
  }: SearchBcAddressGeocoderOptions = {}
): Promise<AddressSearchResult[]> {
  const trimmedQuery = query.trim();
  if (trimmedQuery.length < BC_GEOCODER_MIN_QUERY_LENGTH) {
    return [];
  }

  const url = new URL(BC_GEOCODER_URL);
  url.searchParams.set("addressString", trimmedQuery);
  url.searchParams.set("autoComplete", "true");
  url.searchParams.set("maxResults", String(limit));
  url.searchParams.set("outputSRS", "4326");
  url.searchParams.set("bbox", bbox.join(","));

  const apiKey = import.meta.env.VITE_BC_GEOCODER_API_KEY?.trim();
  if (apiKey) {
    url.searchParams.set("apikey", apiKey);
  }

  const response = await fetch(url.toString(), {
    signal,
    headers: {
      Accept: "application/geo+json, application/json",
    },
  });

  if (!response.ok) {
    throw new Error("Place and address search is unavailable right now.");
  }

  const payload = (await response.json()) as BcGeocoderFeatureCollection;
  return (payload.features ?? [])
    .map(toAddressSearchResult)
    .filter((result): result is AddressSearchResult => result !== null);
}
