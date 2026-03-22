import { describe, expect, it } from "vitest";
import { DA_METRICS_BY_ID } from "../../src/features/hvi-map/config/daMetrics";
import { REGION_HVI_METRIC } from "../../src/features/hvi-map/config/regionConfig";

describe("metric display domains", () => {
  it("uses p05-p95 clipped display domains for continuous HVI, heat, and fraction metrics", () => {
    const clippedMetrics = {
      hvi_index_n01: [0.23931, 0.52972],
      exposure_index: [0.359647, 0.840795],
      sensitivity_index: [0.073525, 0.332616],
      adaptive_capacity_index: [0.442555, 0.819452],
      exposure_mean: [23.61, 30.05],
      green_frac: [0.034259, 0.547479],
      frac_deciduous: [0.023555, 0.385317],
      frac_buildings: [0.037787, 0.422276],
      frac_paved: [0.10593, 0.574963],
      hardscape_frac: [0.154105, 0.913943],
      low_income_rate: [3.6, 22],
      pct_seniors_65plus: [3.181677, 21.982034],
      pct_living_alone: [2.388535, 33.797171],
      pct_renter: [6.666667, 80.304272],
    } as const;

    for (const [metricId, [min, max]] of Object.entries(clippedMetrics)) {
      const metric = DA_METRICS_BY_ID[metricId as keyof typeof clippedMetrics];
      expect(metric.displayScaleStrategy).toBe("p05-p95");
      expect(metric.displayDomainMin).toBe(min);
      expect(metric.displayDomainMax).toBe(max);
    }

    expect(REGION_HVI_METRIC.displayScaleStrategy).toBe("p05-p95");
    expect(REGION_HVI_METRIC.displayDomainMin).toBe(0.13887);
    expect(REGION_HVI_METRIC.displayDomainMax).toBe(0.437972);
  });

  it("uses zero-p95 clipped display domains for zero-heavy metrics", () => {
    const zeroHeavyMetrics = {
      unemployment_rate: 16.2,
      pct_core_need: 32.288306,
      pct_major_repairs: 13.636364,
      frac_coniferous: 0.181717,
      frac_shrub: 0.080396,
      frac_other_built: 0.010273,
    } as const;

    for (const [metricId, max] of Object.entries(zeroHeavyMetrics)) {
      const metric = DA_METRICS_BY_ID[metricId as keyof typeof zeroHeavyMetrics];
      expect(metric.displayScaleStrategy).toBe("zero-p95");
      expect(metric.displayDomainMin).toBe(0);
      expect(metric.displayDomainMax).toBe(max);
    }
  });

  it("uses a p01-p99 clipped display domain for heavy-tailed population counts", () => {
    expect(DA_METRICS_BY_ID.pop_total.displayScaleStrategy).toBe("p01-p99");
    expect(DA_METRICS_BY_ID.pop_total.displayDomainMin).toBe(217.31);
    expect(DA_METRICS_BY_ID.pop_total.displayDomainMax).toBe(2513.28);
  });
});
