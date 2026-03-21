import { describe, expect, it } from "vitest";
import {
  formatFilterInputValue,
  getFilterInputStep,
  isFilterRangeActive,
  normalizeFilterRange,
} from "../../src/features/hvi-map/state/filterRanges";

describe("filterRanges", () => {
  it("normalizes swapped ranges and clamps them to the metric domain", () => {
    expect(normalizeFilterRange("hvi_index_n01", 0.8, -1)).toEqual({
      min: 0.06462950439663971,
      max: 0.733616020899424,
    });

    expect(normalizeFilterRange("exposure_mean", 30, 20)).toEqual({
      min: 20,
      max: 30,
    });
  });

  it("treats only non-default ranges as active filters", () => {
    expect(
      isFilterRangeActive("pop_total", {
        min: 0,
        max: 8800,
      })
    ).toBe(false);

    expect(
      isFilterRangeActive("pop_total", {
        min: 100,
        max: 8800,
      })
    ).toBe(true);
  });

  it("derives slider steps and compact input formatting from metric format", () => {
    expect(getFilterInputStep("integer")).toBe(1);
    expect(getFilterInputStep("percent1")).toBe(0.1);
    expect(getFilterInputStep("number2")).toBe(0.01);
    expect(getFilterInputStep("score3")).toBe(0.001);

    expect(formatFilterInputValue(42, "integer")).toBe("42");
    expect(formatFilterInputValue(12.3, "percent1")).toBe("12.3");
    expect(formatFilterInputValue(28.9, "number2")).toBe("28.9");
    expect(formatFilterInputValue(0.25, "score3")).toBe("0.25");
  });
});
