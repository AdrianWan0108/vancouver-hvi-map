import { describe, expect, it } from "vitest";
import type { DaFeatureProperties } from "../../src/features/hvi-map/types/data";
import {
  getDaComponentDetailCards,
  getDaHviSummaryDetail,
} from "../../src/features/hvi-map/components/daComponentDetails";

const da: DaFeatureProperties = {
  DGUID: "2021S051259150688",
  DAUID: "59150688",
  hvi_index_n01: 0.402,
  sensitivity_index: 0.127,
  adaptive_capacity_index: 0.646,
  exposure_index: 0.725,
  exposure_mean: 28.9,
  hardscape_frac: 0.612,
  frac_buildings: 0.121,
  frac_paved: 0.333,
  frac_other_built: 0.158,
  unemployment_rate: 6.2,
  low_income_rate: 14.8,
  pct_seniors_65plus: 9.3,
  pct_living_alone: 18.1,
  green_frac: 0.441,
  pct_renter: 37.2,
  pct_major_repairs: 4.4,
  pct_core_need: 9.8,
  frac_coniferous: 0.051,
  frac_deciduous: 0.301,
  frac_shrub: 0.089,
};

describe("DA component detail helpers", () => {
  it("builds an HVI summary strip with formula context", () => {
    expect(getDaHviSummaryDetail(da)).toEqual({
      scoreValue: "0.402",
      formula: "HVI = (E + S + (1 - A)) / 3",
      note: "Higher Exposure and Sensitivity raise HVI, while higher Adaptive Capacity lowers it.",
    });
  });

  it("groups indicators into exposure, sensitivity, and adaptive capacity cards", () => {
    const cards = getDaComponentDetailCards(da);

    expect(cards.map((card) => card.title)).toEqual([
      "Exposure (E)",
      "Sensitivity (S)",
      "Adaptive Capacity (A)",
    ]);

    expect(cards[0].previewSegments.map((segment) => segment.paletteId)).toEqual([
      "heat",
      "built",
    ]);
    expect(cards[0].sections[0].rows.map((row) => row.metricId)).toEqual([
      "exposure_mean",
      "hardscape_frac",
    ]);
    expect(cards[0].sections[1].rows.map((row) => row.metricId)).toEqual([
      "frac_buildings",
      "frac_paved",
      "frac_other_built",
    ]);

    expect(cards[1].previewSegments.every((segment) => segment.paletteId === "social")).toBe(
      true
    );
    expect(cards[1].sections[0].rows.map((row) => row.metricId)).toEqual([
      "unemployment_rate",
      "low_income_rate",
      "pct_seniors_65plus",
      "pct_living_alone",
    ]);

    expect(cards[2].sections[0].rows.map((row) => row.metricId)).toEqual([
      "green_frac",
      "pct_renter",
      "pct_major_repairs",
      "pct_core_need",
    ]);
    expect(cards[2].previewSegments.map((segment) => segment.paletteId)).toEqual([
      "adaptive",
      "housing",
      "housing",
      "housing",
    ]);
    expect(cards[2].sections[1].rows.map((row) => row.metricId)).toEqual([
      "frac_coniferous",
      "frac_deciduous",
      "frac_shrub",
    ]);
  });

  it("computes display bar metadata from the configured metric domains", () => {
    const cards = getDaComponentDetailCards(da);
    const exposureMean = cards[0].sections[0].rows[0];

    expect(exposureMean.value).toBe("28.90");
    expect(exposureMean.barPercent).toBeGreaterThan(0);
    expect(exposureMean.barPercent).toBeLessThan(1);
  });
});
