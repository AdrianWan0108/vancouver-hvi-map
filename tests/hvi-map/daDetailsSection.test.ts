import { describe, expect, it } from "vitest";
import {
  getDefaultDaDetailsExpandedState,
  getDaDetailsGroups,
  type DaDetailsGroup,
} from "../../src/features/hvi-map/components/daDetailsGroups";
import type { DaFeatureProperties } from "../../src/features/hvi-map/types/data";

function findRowValue(
  groups: DaDetailsGroup[],
  label: string
): string | undefined {
  return groups
    .flatMap((group) => group.rows)
    .find((row) => row.label === label)?.value;
}

describe("DA details groups", () => {
  it("matches the updated housing and built environment sections", () => {
    const da: DaFeatureProperties = {
      DGUID: "A",
      DAUID: "A",
      hvi_index_n01: 0.5,
      sensitivity_index: 0.4,
      adaptive_capacity_index: 0.7,
      exposure_index: 0.6,
      exposure_mean: 24.321,
      pop_total: 1234,
      unemployment_rate: 10.4,
      low_income_rate: 22.6,
      pct_seniors_65plus: 18.2,
      pct_living_alone: 33.3,
      pct_renter: 65.5,
      pct_core_need: 21.1,
      pct_major_repairs: 7.9,
      green_frac: 0.6,
      frac_coniferous: 0.12,
      frac_deciduous: 0.23,
      frac_shrub: 0.04,
      frac_buildings: 0.1234,
      frac_other_built: 0.0456,
      frac_paved: 0.3333,
      hardscape_frac: 0.4567,
    };

    const groups = getDaDetailsGroups(da);
    const labels = groups.flatMap((group) => group.rows.map((row) => row.label));

    expect(groups.map((group) => group.title)).toEqual([
      "HVI Summary",
      "Social & Housing",
      "Land Cover & Built",
    ]);
    expect(groups.map((group) => group.defaultExpanded)).toEqual([true, false, false]);
    expect(groups.map((group) => group.collapsible)).toEqual([false, true, true]);
    expect(labels).toContain("% Renters");
    expect(labels).toContain("% Core Housing Need");
    expect(labels).toContain("% Major Repairs");
    expect(labels).toContain("Buildings");
    expect(labels).toContain("Other Built");
    expect(labels).toContain("Paved");
    expect(labels).toContain("Hardscape");
    expect(labels).not.toContain("Modified Herb");
    expect(labels).not.toContain("Natural Herb");
  });

  it("formats updated metric values consistently", () => {
    const da: DaFeatureProperties = {
      DGUID: "B",
      DAUID: "B",
      hvi_index_n01: 0.5123,
      sensitivity_index: 0.4321,
      adaptive_capacity_index: 0.6789,
      exposure_index: 0.789,
      exposure_mean: 23.456,
      pop_total: 9876,
      unemployment_rate: 11.44,
      low_income_rate: 12.34,
      pct_seniors_65plus: 17.89,
      pct_living_alone: 28.76,
      pct_renter: 45.67,
      pct_core_need: 8.91,
      pct_major_repairs: 3.21,
      green_frac: 0.7654,
      frac_coniferous: 0.1111,
      frac_deciduous: 0.2222,
      frac_shrub: 0.3333,
      frac_buildings: 0.4444,
      frac_other_built: 0.5555,
      frac_paved: 0.6666,
      hardscape_frac: 0.7777,
    };

    const groups = getDaDetailsGroups(da);

    expect(findRowValue(groups, "Exposure Mean (deg C)")).toBe("23.46");
    expect(findRowValue(groups, "% Major Repairs")).toBe("3.2%");
    expect(findRowValue(groups, "Buildings")).toBe("0.444");
    expect(findRowValue(groups, "Population")).toBe("9,876");
  });

  it("defaults secondary DA groups to collapsed", () => {
    expect(getDefaultDaDetailsExpandedState()).toEqual({
      "HVI Summary": true,
      "Social & Housing": false,
      "Land Cover & Built": false,
    });
  });
});
