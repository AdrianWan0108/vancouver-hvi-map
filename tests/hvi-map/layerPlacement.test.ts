import { describe, expect, it } from "vitest";
import { getFirstPlaceLabelLayerId } from "../../src/features/hvi-map/map/layerPlacement";

describe("layer placement helpers", () => {
  it("finds the first place-name label layer instead of any text layer", () => {
    expect(
      getFirstPlaceLabelLayerId([
        { id: "background", type: "background" },
        { id: "water", type: "fill" },
        { id: "road-labels", type: "symbol", layout: { "text-field": ["get", "name"] } },
        { id: "place-labels", type: "symbol", layout: { "text-field": ["get", "name"] } },
        { id: "poi-labels", type: "symbol", layout: { "text-field": ["get", "name_en"] } },
      ])
    ).toBe("place-labels");
  });

  it("returns undefined when the style has no place-name text layers", () => {
    expect(
      getFirstPlaceLabelLayerId([
        { id: "background", type: "background" },
        { id: "water", type: "fill" },
        { id: "road-labels", type: "symbol", layout: { "text-field": ["get", "name"] } },
      ])
    ).toBeUndefined();
  });
});
