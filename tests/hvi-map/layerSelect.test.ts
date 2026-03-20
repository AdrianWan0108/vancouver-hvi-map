import { describe, expect, it } from "vitest";
import { getLayerMetricGroups } from "../../src/features/hvi-map/components/layerOptions";

describe("layer select groups", () => {
  it("groups metrics by HVI methodology while preserving the intended order", () => {
    const groups = getLayerMetricGroups();

    expect(groups.map((group) => group.label)).toEqual([
      "HVI",
      "Exposure (E)",
      "Sensitivity (S)",
      "Adaptive Capacity (A)",
      "Context",
    ]);

    expect(groups[0].metrics.map((metric) => metric.id)).toEqual([
      "hvi_index_n01",
    ]);
    expect(groups[1].metrics.map((metric) => metric.id)).toEqual([
      "exposure_index",
      "exposure_mean",
      "hardscape_frac",
      "frac_buildings",
      "frac_paved",
      "frac_other_built",
    ]);
    expect(groups[2].metrics.map((metric) => metric.id)).toEqual([
      "sensitivity_index",
      "unemployment_rate",
      "low_income_rate",
      "pct_seniors_65plus",
      "pct_living_alone",
    ]);
    expect(groups[3].metrics.map((metric) => metric.id)).toEqual([
      "adaptive_capacity_index",
      "green_frac",
      "pct_renter",
      "pct_major_repairs",
      "pct_core_need",
      "frac_coniferous",
      "frac_deciduous",
      "frac_shrub",
    ]);
    expect(groups[4].metrics.map((metric) => metric.id)).toEqual(["pop_total"]);
  });
});
