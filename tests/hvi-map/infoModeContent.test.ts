import { describe, expect, it } from "vitest";
import { getInfoGuideContent } from "../../src/features/hvi-map/components/infoModeContent";

describe("info mode guide content", () => {
  it("returns a region-first guide for the regional view", () => {
    const content = getInfoGuideContent("region");

    expect(content.heading).toBe("How to explore");
    expect(content.steps).toHaveLength(3);
    expect(content.steps[0]).toEqual({
      title: "Find a location",
      description:
        "Search for a region, DAUID, place, or address, or start from the regional map view.",
    });
    expect(content.steps[1].description).toContain("Hover regions");
    expect(content.steps[1].description).toContain("zoom in");
    expect(content.steps[2].description).toContain("How HVI is built");
  });

  it("returns a DA-specific guide for the DA view", () => {
    const content = getInfoGuideContent("da");

    expect(content.heading).toBe("How to explore");
    expect(content.steps).toHaveLength(3);
    expect(content.steps[0]).toEqual({
      title: "Inspect a DA",
      description:
        "Hover a DA to preview its summary, then click to keep it selected while exploring nearby areas.",
    });
    expect(content.steps[1].description).toContain("layers");
    expect(content.steps[1].description).toContain("filters");
    expect(content.steps[2].description).toContain("Exposure, Sensitivity, and Adaptive Capacity");
  });

  it("replaces the old placeholder guidance", () => {
    const regionContent = getInfoGuideContent("region");
    const daContent = getInfoGuideContent("da");
    const combinedDescriptions = [...regionContent.steps, ...daContent.steps]
      .map((step) => step.description)
      .join(" ");

    expect(combinedDescriptions).not.toContain("Hover a region to preview its summary.");
    expect(combinedDescriptions).not.toContain(
      "The layer, filters, and legend stay pinned below so you can change the map at any time."
    );
  });
});
