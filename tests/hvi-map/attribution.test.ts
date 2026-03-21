import { describe, expect, it } from "vitest";
import { collapseCompactAttributionControl } from "../../src/features/hvi-map/map/attribution";

function createAttributionElement(initialClasses: string[], open: boolean) {
  const classes = new Set(initialClasses);
  const attributes = new Set<string>(open ? ["open"] : []);

  return {
    classList: {
      contains: (value: string) => classes.has(value),
      remove: (...values: string[]) => {
        values.forEach((value) => classes.delete(value));
      },
    },
    removeAttribute: (name: string) => {
      attributes.delete(name);
    },
    hasAttribute: (name: string) => attributes.has(name),
  };
}

describe("collapseCompactAttributionControl", () => {
  it("removes the expanded compact state from the attribution control", () => {
    const attribution = createAttributionElement(
      ["maplibregl-ctrl-attrib", "maplibregl-compact", "maplibregl-compact-show"],
      true
    );
    const container = {
      querySelector: () => attribution,
    } as unknown as ParentNode;

    collapseCompactAttributionControl(container);

    expect(attribution.classList.contains("maplibregl-compact-show")).toBe(false);
    expect(attribution.hasAttribute("open")).toBe(false);
  });

  it("ignores non-compact attribution controls", () => {
    const attribution = createAttributionElement(["maplibregl-ctrl-attrib"], true);
    const container = {
      querySelector: () => attribution,
    } as unknown as ParentNode;

    collapseCompactAttributionControl(container);

    expect(attribution.hasAttribute("open")).toBe(true);
  });
});
