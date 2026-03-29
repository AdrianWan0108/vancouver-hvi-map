import { describe, expect, it } from "vitest";
import {
  getDaSelectedPlaceContent,
  getRegionSelectedPlaceContent,
  shouldShowDaControls,
  shouldShowInfoModeContent,
} from "../../src/features/hvi-map/components/panelContent";
import { getRegionDetailsRows } from "../../src/features/hvi-map/components/regionDetails";

describe("panel content helpers", () => {
  it("keeps DA controls available whenever DA mode is active", () => {
    expect(shouldShowDaControls("da")).toBe(true);
    expect(shouldShowDaControls("region")).toBe(false);
  });

  it("shows info-mode content only when no active detail target is present", () => {
    expect(
      shouldShowInfoModeContent({
        zoomMode: "region",
        panelMode: "info",
        hasActiveDa: false,
        hasActiveRegion: false,
      })
    ).toBe(true);

    expect(
      shouldShowInfoModeContent({
        zoomMode: "da",
        panelMode: "hover",
        hasActiveDa: true,
        hasActiveRegion: false,
      })
    ).toBe(false);

    expect(
      shouldShowInfoModeContent({
        zoomMode: "region",
        panelMode: "locked",
        hasActiveDa: false,
        hasActiveRegion: true,
      })
    ).toBe(false);
  });

  it("builds selected-place content for active DAs", () => {
    expect(
      getDaSelectedPlaceContent({
        activeDaDauid: "59150657",
        activeDaRegionName: "Vancouver",
        activeDaPopulation: 642,
      })
    ).toEqual({
      eyebrow: "Selected dissemination area",
      title: "Dissemination Area 59150657",
      subtitle: "Vancouver",
      meta: "Population: 642",
    });
  });

  it("builds selected-place content for active regions", () => {
    expect(
      getRegionSelectedPlaceContent({
        FullName: "Burnaby",
        MunNum: 3,
        region_pop_total: 249125,
      })
    ).toEqual({
      title: "Burnaby",
      eyebrow: "Selected region",
      subtitle: "Region 3",
      meta: "Population: 249,125",
    });
  });

  it("omits DA population metadata when population is unavailable", () => {
    expect(
      getDaSelectedPlaceContent({
        activeDaDauid: "59150657",
        activeDaRegionName: "Vancouver",
        activeDaPopulation: null,
      })
    ).toEqual({
      eyebrow: "Selected dissemination area",
      title: "Dissemination Area 59150657",
      subtitle: "Vancouver",
      meta: null,
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
