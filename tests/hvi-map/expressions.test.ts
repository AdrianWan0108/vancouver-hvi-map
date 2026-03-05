import { describe, expect, it } from "vitest";
import { DA_METRICS_BY_ID } from "../../src/features/hvi-map/config/daMetrics";
import {
  buildDaFillOpacityExpression,
  buildFillColorExpression,
  buildFilterExpression,
} from "../../src/features/hvi-map/map/expressions";
import { createInitialMapUiState } from "../../src/features/hvi-map/state/reducer";

describe("map expressions", () => {
  it("builds color expression from selected metric property", () => {
    const expression = buildFillColorExpression(DA_METRICS_BY_ID.hvi_index_n01);
    expect(expression[0]).toBe("interpolate");
    expect(JSON.stringify(expression)).toContain("hvi_index_n01");
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

  it("uses filter expression to hide out-of-range fill opacity", () => {
    const filterExpression = ["all", ["has", "hvi_index_n01"]];
    const fillOpacity = buildDaFillOpacityExpression(filterExpression);

    expect(fillOpacity[0]).toBe("case");
    expect(fillOpacity[3]).toBe(0);
  });
});
