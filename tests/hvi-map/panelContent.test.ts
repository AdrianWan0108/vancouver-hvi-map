import { describe, expect, it } from "vitest";
import {
  getPeripheralVisibilityDescription,
  isPeripheralVisibilityControlDisabled,
  shouldShowDaControls,
  shouldShowViewOptions,
} from "../../src/features/hvi-map/components/panelContent";
import { getRegionDetailsRows } from "../../src/features/hvi-map/components/regionDetails";

describe("panel content helpers", () => {
  it("keeps peripheral visibility enabled only in region mode", () => {
    expect(isPeripheralVisibilityControlDisabled("region")).toBe(false);
    expect(isPeripheralVisibilityControlDisabled("da")).toBe(true);
    expect(shouldShowViewOptions("region")).toBe(true);
    expect(shouldShowViewOptions("da")).toBe(false);
    expect(getPeripheralVisibilityDescription("region")).toContain("below 5,000");
    expect(getPeripheralVisibilityDescription("da")).toContain("Region view only");
  });

  it("keeps DA controls available whenever DA mode is active", () => {
    expect(shouldShowDaControls("da")).toBe(true);
    expect(shouldShowDaControls("region")).toBe(false);
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
