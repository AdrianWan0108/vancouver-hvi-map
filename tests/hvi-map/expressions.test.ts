import { describe, expect, it } from "vitest";
import { DA_METRICS_BY_ID } from "../../src/features/hvi-map/config/daMetrics";
import { REGION_HVI_METRIC } from "../../src/features/hvi-map/config/regionConfig";
import {
  buildDaPeripheralVisibilityFilterExpression,
  DA_ZOOM_REGION_DIVIDER_CASING_STYLE,
  DA_ZOOM_REGION_DIVIDER_STYLE,
  buildDaFillOpacityExpression,
  buildFillColorExpression,
  buildFilterExpression,
  buildLockedFeatureFilterExpression,
  buildRegionVisibilityFilterExpression,
  LOCKED_DA_OUTLINE_STYLE,
} from "../../src/features/hvi-map/map/expressions";
import { createInitialMapUiState } from "../../src/features/hvi-map/state/reducer";

describe("map expressions", () => {
  it("uses the context palette and clipped p01-p99 domain for population layers", () => {
    const expression = buildFillColorExpression(DA_METRICS_BY_ID.pop_total);

    expect(DA_METRICS_BY_ID.pop_total.displayScaleStrategy).toBe("p01-p99");
    expect(expression[0]).toBe("interpolate");
    expect(expression[2]).toEqual([
      "max",
      217.31,
      [
        "min",
        2513.28,
        ["coalesce", ["to-number", ["get", "pop_total"]], 217.31],
      ],
    ]);
    expect(expression[3]).toBe(217.31);
    expect(expression[4]).toBe("#edf4ff");
    expect(expression[5]).toBeCloseTo(1365.295);
    expect(expression[6]).toBe("#6c8ef6");
    expect(expression[7]).toBe(2513.28);
    expect(expression[8]).toBe("#1d4f8c");
  });

  it("uses the adaptive palette and clipped p05-p95 domain for greenness metrics", () => {
    const expression = buildFillColorExpression(DA_METRICS_BY_ID.green_frac);

    expect(DA_METRICS_BY_ID.green_frac.displayScaleStrategy).toBe("p05-p95");
    expect(expression[3]).toBe(0.034259);
    expect(expression[4]).toBe("#eef7e8");
    expect(expression[5]).toBeCloseTo(0.290869);
    expect(expression[6]).toBe("#78a67e");
    expect(expression[7]).toBe(0.547479);
    expect(expression[8]).toBe("#1b4332");
  });

  it("uses the hvi palette and clipped p05-p95 domain for HVI metrics", () => {
    const expression = buildFillColorExpression(DA_METRICS_BY_ID.hvi_index_n01);

    expect(DA_METRICS_BY_ID.hvi_index_n01.displayScaleStrategy).toBe("p05-p95");
    expect(expression[3]).toBe(0.23931);
    expect(expression[4]).toBe("#fff1d6");
    expect(expression[5]).toBeCloseTo(0.384515);
    expect(expression[6]).toBe("#f0a35f");
    expect(expression[7]).toBe(0.52972);
    expect(expression[8]).toBe("#9b2226");
  });

  it("uses clipped percentile domains for percentage indicators", () => {
    const expression = buildFillColorExpression(DA_METRICS_BY_ID.pct_renter);

    expect(DA_METRICS_BY_ID.pct_renter.displayScaleStrategy).toBe("p05-p95");
    expect(expression[3]).toBe(6.666667);
    expect(expression[4]).toBe("#fff0e7");
    expect(expression[5]).toBeCloseTo(43.4854695);
    expect(expression[6]).toBe("#d88766");
    expect(expression[7]).toBe(80.304272);
    expect(expression[8]).toBe("#934534");
  });

  it("uses clipped p05-p95 domains for temperature-based heat metrics", () => {
    const expression = buildFillColorExpression(DA_METRICS_BY_ID.exposure_mean);

    expect(DA_METRICS_BY_ID.exposure_mean.displayScaleStrategy).toBe("p05-p95");
    expect(expression[3]).toBe(23.61);
    expect(expression[4]).toBe("#fff4de");
    expect(expression[5]).toBeCloseTo(26.83);
    expect(expression[6]).toBe("#e7a34d");
    expect(expression[7]).toBe(30.05);
    expect(expression[8]).toBe("#bb6a1e");
  });

  it("uses a clipped p05-p95 color domain for regional HVI", () => {
    const expression = buildFillColorExpression(REGION_HVI_METRIC);

    expect(REGION_HVI_METRIC.displayScaleStrategy).toBe("p05-p95");
    expect(expression[3]).toBe(0.13887);
    expect(expression[4]).toBe("#fff1d6");
    expect(expression[5]).toBeCloseTo(0.288421);
    expect(expression[7]).toBe(0.437972);
    expect(expression[8]).toBe("#9b2226");
  });

  it("returns true filter when all filters are at their full domains", () => {
    const state = createInitialMapUiState();
    const expression = buildFilterExpression(state.filters, DA_METRICS_BY_ID);
    expect(expression).toBe(true);
  });

  it("builds all-clauses expression when multiple ranges are active", () => {
    const state = createInitialMapUiState();
    const filters = {
      ...state.filters,
      hvi_index_n01: {
        ...state.filters.hvi_index_n01,
        min: 0.2,
        max: 0.7,
      },
      pop_total: {
        ...state.filters.pop_total,
        min: 200,
        max: 1200,
      },
    };

    const expression = buildFilterExpression(filters, DA_METRICS_BY_ID);
    expect(Array.isArray(expression)).toBe(true);
    if (Array.isArray(expression)) {
      expect(expression[0]).toBe("all");
      const text = JSON.stringify(expression);
      expect(text).toContain("hvi_index_n01");
      expect(text).toContain("pop_total");
    }
  });

  it("hides selected metrics that have no data", () => {
    const fillOpacity = buildDaFillOpacityExpression(
      DA_METRICS_BY_ID.low_income_rate,
      true
    );

    expect(fillOpacity[0]).toBe("case");
    expect(fillOpacity[1]).toEqual(["has", "low_income_rate"]);
    expect(fillOpacity[3]).toBe(0);
  });

  it("builds a region filter when peripheral areas are hidden", () => {
    const expression = buildRegionVisibilityFilterExpression(false, 5000, [6], []);

    expect(expression).toEqual([
      "all",
      [
        "all",
        ["has", "region_pop_total"],
        [">=", ["to-number", ["get", "region_pop_total"]], 5000],
      ],
      ["!", ["in", ["to-string", ["get", "MunNum"]], ["literal", ["6"]]]],
    ]);
  });

  it("builds a DA filter that hides only peripheral DAs when the toggle is off", () => {
    expect(
      buildDaPeripheralVisibilityFilterExpression(false, [
        "2021S051259999001",
        "2021S051259999002",
      ])
    ).toEqual([
      "all",
      ["has", "DGUID"],
      [
        "!",
        [
          "in",
          ["to-string", ["get", "DGUID"]],
          ["literal", ["2021S051259999001", "2021S051259999002"]],
        ],
      ],
    ]);
  });

  it("builds a locked-feature filter that matches the selected DA", () => {
    expect(buildLockedFeatureFilterExpression("DGUID", "2021S051259150657")).toEqual([
      "all",
      ["has", "DGUID"],
      ["==", ["get", "DGUID"], "2021S051259150657"],
    ]);
  });

  it("builds a locked-feature filter that matches nothing when no DA is locked", () => {
    expect(buildLockedFeatureFilterExpression("DGUID", null)).toEqual([
      "all",
      ["has", "DGUID"],
      ["==", ["get", "DGUID"], "__map_no_locked_feature__"],
    ]);
  });

  it("keeps DA-zoom region dividers weaker than the locked DA outline", () => {
    expect(DA_ZOOM_REGION_DIVIDER_CASING_STYLE).toEqual({
      color: "rgba(255, 248, 236, 0.96)",
      width: 4.6,
      opacity: 0.96,
    });
    expect(DA_ZOOM_REGION_DIVIDER_STYLE).toEqual({
      color: "rgba(15, 23, 42, 0.45)",
      width: 1.6,
      opacity: 0.45,
    });
    expect(LOCKED_DA_OUTLINE_STYLE).toEqual({
      color: "rgba(15, 23, 42, 0.95)",
      width: 3,
      opacity: 0.95,
    });
    expect(DA_ZOOM_REGION_DIVIDER_CASING_STYLE.width).toBeGreaterThan(
      DA_ZOOM_REGION_DIVIDER_STYLE.width
    );
    expect(LOCKED_DA_OUTLINE_STYLE.width).toBeGreaterThan(
      DA_ZOOM_REGION_DIVIDER_STYLE.width
    );
  });
});
