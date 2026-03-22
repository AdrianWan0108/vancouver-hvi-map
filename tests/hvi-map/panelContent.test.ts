import { describe, expect, it } from "vitest";
import {
  getPanelHeaderContent,
  shouldShowDaControls,
} from "../../src/features/hvi-map/components/panelContent";
import { getRegionDetailsRows } from "../../src/features/hvi-map/components/regionDetails";

describe("panel content helpers", () => {
  it("keeps DA controls available whenever DA mode is active", () => {
    expect(shouldShowDaControls("da")).toBe(true);
    expect(shouldShowDaControls("region")).toBe(false);
  });

  it("builds compact panel headers for DA and region contexts", () => {
    expect(
      getPanelHeaderContent({
        zoomMode: "da",
        activeDaDauid: "59150657",
        activeDaRegionName: "Vancouver",
        activeRegionName: null,
      })
    ).toEqual({
      title: "DA 59150657",
      subtitle: "Vancouver",
    });

    expect(
      getPanelHeaderContent({
        zoomMode: "region",
        activeDaDauid: null,
        activeDaRegionName: null,
        activeRegionName: "Burnaby",
      })
    ).toEqual({
      title: "Burnaby",
      subtitle: null,
    });
  });

  it("surfaces final region summary fields without duplicating raw HVI", () => {
    const rows = getRegionDetailsRows({
      MunNum: 7,
      FullName: "North Shore",
      region_hvi_n01: 0.321,
      region_hvi_raw_pw: 0.321,
      region_pop_total: 4900,
      da_count_used: 18,
    });

    expect(rows).toEqual([
      { label: "Regional HVI", value: "0.321" },
      { label: "Population", value: "4,900" },
      { label: "DAs Used", value: "18" },
    ]);
  });
});
