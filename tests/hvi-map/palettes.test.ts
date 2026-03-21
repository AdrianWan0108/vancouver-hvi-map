import { describe, expect, it } from "vitest";
import { METRIC_PALETTES, getPaletteConfig } from "../../src/features/hvi-map/config/palettes";

describe("metric palettes", () => {
  it("defines all semantic palette families with descriptions", () => {
    expect(Object.keys(METRIC_PALETTES)).toEqual([
      "hvi",
      "heat",
      "social",
      "housing",
      "adaptive",
      "context",
      "built",
    ]);

    expect(getPaletteConfig("hvi").description).toBe(
      "Higher values indicate greater overall heat vulnerability."
    );
    expect(getPaletteConfig("heat").description).toBe(
      "Higher values indicate greater heat exposure."
    );
    expect(getPaletteConfig("social").description).toBe(
      "Higher values indicate greater social sensitivity or vulnerability."
    );
    expect(getPaletteConfig("housing").description).toBe(
      "Higher values indicate greater housing stress."
    );
    expect(getPaletteConfig("adaptive").description).toBe(
      "Higher values indicate more protective green cover or adaptive capacity."
    );
    expect(getPaletteConfig("context").description).toBe(
      "Higher values indicate more people in the selected area."
    );
    expect(getPaletteConfig("built").description).toBe(
      "Higher values indicate more hard or built surface cover contributing to heat exposure."
    );
  });
});
