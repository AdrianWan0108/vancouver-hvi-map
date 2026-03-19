import { describe, expect, it } from "vitest";
import { DA_METRICS_BY_ID } from "../../src/features/hvi-map/config/daMetrics";
import {
  buildDaFillOpacityExpression,
  buildFillColorExpression,
  buildFilterExpression,
  buildRegionVisibilityFilterExpression,
} from "../../src/features/hvi-map/map/expressions";
import { createInitialMapUiState } from "../../src/features/hvi-map/state/reducer";

describe("map expressions", () => {
  it("uses the density palette for population layers", () => {
    const expression = buildFillColorExpression(DA_METRICS_BY_ID.pop_total);

    expect(expression[0]).toBe("interpolate");
    expect(expression[2]).toEqual([
      "max",
      0,
      ["min", 8800, ["coalesce", ["to-number", ["get", "pop_total"]], 0]],
    ]);
    expect(expression[3]).toBe(0);
    expect(expression[4]).toBe("#edf4ff");
    expect(expression[5]).toBe(4400);
    expect(expression[6]).toBe("#5b7cfa");
    expect(expression[7]).toBe(8800);
    expect(expression[8]).toBe("#1d3557");
  });

  it("uses the benefit palette for greenness metrics", () => {
    const expression = buildFillColorExpression(DA_METRICS_BY_ID.green_frac);

    expect(expression[3]).toBe(0);
    expect(expression[4]).toBe("#eef7e8");
    expect(expression[7]).toBe(0.9769045884923524);
    expect(expression[8]).toBe("#1b4332");
  });

  it("uses the risk palette for vulnerability metrics", () => {
    const expression = buildFillColorExpression(DA_METRICS_BY_ID.hvi_index_n01);

    expect(expression[3]).toBe(0.06462950439663971);
    expect(expression[4]).toBe("#fff1d6");
    expect(expression[8]).toBe("#9b2226");
  });

  it("returns true filter when no filters are enabled", () => {
    const state = createInitialMapUiState();
    const expression = buildFilterExpression(state.filters, DA_METRICS_BY_ID);
    expect(expression).toBe(true);
  });

  it("builds all-clauses expression when multiple filters are enabled", () => {
    const state = createInitialMapUiState();
    const filters = {
      ...state.filters,
      hvi_index_n01: {
        ...state.filters.hvi_index_n01,
        enabled: true,
        min: 0.2,
        max: 0.8,
      },
      pop_total: {
        ...state.filters.pop_total,
        enabled: true,
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
    const expression = buildRegionVisibilityFilterExpression(false, 5000);

    expect(expression).toEqual([
      "all",
      ["has", "region_pop_total"],
      [">=", ["to-number", ["get", "region_pop_total"]], 5000],
    ]);
  });
});
