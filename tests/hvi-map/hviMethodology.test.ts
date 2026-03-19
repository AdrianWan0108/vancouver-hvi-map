import { describe, expect, it } from "vitest";
import {
  HVI_METHOD_FINAL_FORMULA,
  HVI_METHOD_INTERPRETATION,
  HVI_METHODOLOGY_NOTE,
  HVI_METHODOLOGY_SECTIONS,
} from "../../src/features/hvi-map/components/hviMethodology";

describe("HVI methodology content", () => {
  it("includes the final HVI formula and interpretation", () => {
    expect(HVI_METHOD_FINAL_FORMULA).toBe("HVI = (E + S + (1 - A)) / 3");
    expect(HVI_METHOD_INTERPRETATION).toContain("higher A reduces vulnerability");
  });

  it("covers exposure, sensitivity, and adaptive capacity construction", () => {
    expect(HVI_METHODOLOGY_SECTIONS.map((section) => section.title)).toEqual([
      "Exposure (E)",
      "Sensitivity (S)",
      "Adaptive Capacity (A)",
    ]);

    expect(HVI_METHODOLOGY_SECTIONS[0].formula).toContain(
      "0.67 * exposure_mean_n01 + 0.33 * hardscape_frac_n01"
    );
    expect(HVI_METHODOLOGY_SECTIONS[0].indicators.join(" ")).toContain(
      "1 Buildings"
    );
    expect(HVI_METHODOLOGY_SECTIONS[1].formula).toContain(
      "pct_seniors_65plus_n01"
    );
    expect(HVI_METHODOLOGY_SECTIONS[2].indicators.join(" ")).toContain(
      "6 Coniferous"
    );
    expect(HVI_METHODOLOGY_NOTE).toContain("do not expose every normalized subcomponent");
  });
});
