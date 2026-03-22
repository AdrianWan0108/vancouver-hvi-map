import { afterEach, describe, expect, it, vi } from "vitest";
import {
  BC_GEOCODER_MIN_QUERY_LENGTH,
  METRO_VANCOUVER_SEARCH_BBOX,
  searchBcAddressGeocoder,
} from "../../src/features/hvi-map/search/bcGeocoder";

describe("BC Address Geocoder helper", () => {
  const originalApiKey = import.meta.env.VITE_BC_GEOCODER_API_KEY;

  afterEach(() => {
    vi.restoreAllMocks();
    (import.meta.env as ImportMetaEnv).VITE_BC_GEOCODER_API_KEY = originalApiKey;
  });

  it("does not call the network when the query is below the minimum length", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch");

    await expect(
      searchBcAddressGeocoder("ab".slice(0, BC_GEOCODER_MIN_QUERY_LENGTH - 1))
    ).resolves.toEqual([]);

    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it("maps geocoder results and includes the Metro Vancouver bbox and optional api key", async () => {
    (import.meta.env as ImportMetaEnv).VITE_BC_GEOCODER_API_KEY = "demo-key";

    const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: true,
      json: async () => ({
        features: [
          {
            geometry: { coordinates: [-123.1207, 49.2827] },
            properties: {
              fullAddress: "123 Main St, Vancouver, BC",
              localityName: "Vancouver",
              provinceCode: "BC",
              siteID: "42",
            },
          },
        ],
      }),
    } as Response);

    const results = await searchBcAddressGeocoder("123 Main");

    expect(fetchSpy).toHaveBeenCalledTimes(1);
    const [requestUrl] = fetchSpy.mock.calls[0];
    const parsedUrl = new URL(String(requestUrl));

    expect(parsedUrl.searchParams.get("addressString")).toBe("123 Main");
    expect(parsedUrl.searchParams.get("autoComplete")).toBe("true");
    expect(parsedUrl.searchParams.get("bbox")).toBe(METRO_VANCOUVER_SEARCH_BBOX.join(","));
    expect(parsedUrl.searchParams.get("apikey")).toBe("demo-key");

    expect(results).toEqual([
      {
        kind: "address",
        source: "bc-geocoder",
        key: "bc-address:42",
        label: "123 Main St, Vancouver, BC",
        secondaryLabel: "Vancouver, BC",
        center: [-123.1207, 49.2827],
        bbox: [-123.1207, 49.2827, -123.1207, 49.2827],
      },
    ]);
  });
});
