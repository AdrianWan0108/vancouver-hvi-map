import { describe, expect, it } from "vitest";
import { getSearchResults } from "../../src/features/hvi-map/search";
import type { SearchEntry } from "../../src/features/hvi-map/types/search";

const entries: SearchEntry[] = [
  {
    kind: "region",
    key: "10",
    label: "City of Vancouver",
    secondaryLabel: "Vancouver",
    bbox: [-123.2, 49.2, -123.0, 49.3],
    center: [-123.1, 49.25],
    properties: { FullName: "City of Vancouver", ShortName: "Vancouver", MunNum: 10 },
  },
  {
    kind: "da",
    key: "2021S051259151413",
    label: "DA 2021S051259151413",
    secondaryLabel: "City of Vancouver",
    bbox: [-123.11, 49.26, -123.1, 49.27],
    center: [-123.105, 49.265],
    properties: { DGUID: "2021S051259151413", hvi_index_n01: 0.495 },
    regionName: "City of Vancouver",
  },
];

describe("search helpers", () => {
  it("returns region-name matches before DA matches for the same place name", () => {
    const results = getSearchResults(entries, "vancouver");

    expect(results.map((result) => `${result.kind}:${result.key}`)).toEqual([
      "region:10",
      "da:2021S051259151413",
    ]);
  });

  it("prioritizes DA ID prefix matches", () => {
    const results = getSearchResults(entries, "2021s0512");

    expect(results[0]?.kind).toBe("da");
    expect(results[0]?.key).toBe("2021S051259151413");
  });

  it("requires at least two characters before returning results", () => {
    expect(getSearchResults(entries, "v")).toEqual([]);
  });
});
