import { describe, expect, it } from "vitest";
import {
  derivePeripheralAreaMetadata,
  getRegionKey,
  isPeripheralRegion,
  isPeripheralSearchEntry,
} from "../../src/features/hvi-map/search/peripheralAreas";
import type { SearchIndex } from "../../src/features/hvi-map/types/search";

const mockSearchIndex: SearchIndex = {
  version: 2,
  generatedAt: "2026-03-22T00:00:00.000Z",
  entries: [
    {
      kind: "region",
      key: "6",
      label: "Electoral Area A",
      secondaryLabel: null,
      bbox: [0, 0, 1, 1],
      center: [0.5, 0.5],
      properties: {
        FullName: "Electoral Area A",
        ShortName: "Electoral Area A",
        MunNum: 6,
        region_pop_total: 18243,
        region_hvi_n01: 0.4,
      },
    },
    {
      kind: "region",
      key: "21",
      label: "Bowen Island Municipality",
      secondaryLabel: "Bowen Island",
      bbox: [1, 1, 2, 2],
      center: [1.5, 1.5],
      properties: {
        FullName: "Bowen Island Municipality",
        ShortName: "Bowen Island",
        MunNum: 21,
        region_pop_total: 1978,
        region_hvi_n01: 0.14,
      },
    },
    {
      kind: "region",
      key: "18",
      label: "City of Vancouver",
      secondaryLabel: "Vancouver",
      bbox: [2, 2, 3, 3],
      center: [2.5, 2.5],
      properties: {
        FullName: "City of Vancouver",
        ShortName: "Vancouver",
        MunNum: 18,
        region_pop_total: 657153,
        region_hvi_n01: 0.44,
      },
    },
    {
      kind: "da",
      key: "ea-a-da",
      label: "DA 59158001",
      secondaryLabel: "Electoral Area A",
      bbox: [0, 0, 1, 1],
      center: [0.5, 0.5],
      properties: {
        DGUID: "2021S051259158001",
        DAUID: "59158001",
      },
      regionName: "Electoral Area A",
    },
    {
      kind: "da",
      key: "bowen-da",
      label: "DA 59159001",
      secondaryLabel: "Bowen Island",
      bbox: [1, 1, 2, 2],
      center: [1.5, 1.5],
      properties: {
        DGUID: "2021S051259159001",
        DAUID: "59159001",
      },
      regionName: "Bowen Island Municipality",
    },
    {
      kind: "da",
      key: "van-da",
      label: "DA 59151001",
      secondaryLabel: "Vancouver",
      bbox: [2, 2, 3, 3],
      center: [2.5, 2.5],
      properties: {
        DGUID: "2021S051259151001",
        DAUID: "59151001",
      },
      regionName: "City of Vancouver",
    },
    {
      kind: "da",
      key: "unassigned-da",
      label: "DA 59153569",
      secondaryLabel: null,
      bbox: [3, 3, 4, 4],
      center: [3.5, 3.5],
      properties: {
        DGUID: "2021S051259153569",
        DAUID: "59153569",
      },
      regionName: null,
    },
    {
      kind: "da",
      key: "ubc-da",
      label: "DA 59154034",
      secondaryLabel: null,
      bbox: [3, 3, 4, 4],
      center: [-123.233042, 49.255678],
      properties: {
        DGUID: "2021S051259154034",
        DAUID: "59154034",
      },
      regionName: null,
    },
  ],
};

describe("peripheral area metadata", () => {
  it("uses the threshold rule and the Electoral Area A manual include override", () => {
    expect(
      isPeripheralRegion({
        MunNum: 6,
        FullName: "Electoral Area A",
        ShortName: "Electoral Area A",
        region_pop_total: 18243,
      })
    ).toBe(true);

    expect(
      isPeripheralRegion({
        MunNum: 18,
        FullName: "City of Vancouver",
        ShortName: "Vancouver",
        region_pop_total: 657153,
      })
    ).toBe(false);
  });

  it("derives peripheral region keys and DA DGUIDs from the search index", () => {
    const metadata = derivePeripheralAreaMetadata(mockSearchIndex);

    expect(metadata.peripheralRegionKeys).toEqual(["21", "6"]);
    expect(metadata.peripheralDaDguids).toEqual([
      "2021S051259153569",
      "2021S051259158001",
      "2021S051259159001",
    ]);
    expect(metadata.peripheralDaDguids).not.toContain("2021S051259154034");
  });

  it("identifies peripheral search results for both regions and DAs", () => {
    const metadata = derivePeripheralAreaMetadata(mockSearchIndex);
    const electoralAreaA = mockSearchIndex.entries[0];
    const electoralAreaADa = mockSearchIndex.entries[3];
    const vancouver = mockSearchIndex.entries[2];

    expect(getRegionKey(electoralAreaA.properties)).toBe("6");
    expect(isPeripheralSearchEntry(electoralAreaA, metadata)).toBe(true);
    expect(isPeripheralSearchEntry(electoralAreaADa, metadata)).toBe(true);
    expect(isPeripheralSearchEntry(vancouver, metadata)).toBe(false);
  });
});
