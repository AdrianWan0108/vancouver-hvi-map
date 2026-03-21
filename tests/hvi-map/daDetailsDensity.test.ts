import { describe, expect, it } from "vitest";
import { resolvePanelDensity } from "../../src/features/hvi-map/components/daDetailsDensity";

describe("resolvePanelDensity", () => {
  it("stays comfortable on taller desktop viewports", () => {
    expect(
      resolvePanelDensity({
        isDesktop: true,
        viewportHeight: 980,
        isOverflowing: false,
      })
    ).toBe("comfortable");
  });

  it("switches to compact on medium-height desktops", () => {
    expect(
      resolvePanelDensity({
        isDesktop: true,
        viewportHeight: 780,
        isOverflowing: false,
      })
    ).toBe("compact");
  });

  it("switches to ultra on short desktops", () => {
    expect(
      resolvePanelDensity({
        isDesktop: true,
        viewportHeight: 660,
        isOverflowing: false,
      })
    ).toBe("ultra");
  });

  it("escalates density when the panel scroll container overflows", () => {
    expect(
      resolvePanelDensity({
        isDesktop: true,
        viewportHeight: 980,
        isOverflowing: true,
      })
    ).toBe("compact");

    expect(
      resolvePanelDensity({
        isDesktop: true,
        viewportHeight: 780,
        isOverflowing: true,
      })
    ).toBe("compact");

    expect(
      resolvePanelDensity({
        isDesktop: true,
        viewportHeight: 620,
        isOverflowing: true,
      })
    ).toBe("ultra");
  });

  it("keeps comfortable density on mobile to protect readability", () => {
    expect(
      resolvePanelDensity({
        isDesktop: false,
        viewportHeight: 640,
        isOverflowing: true,
      })
    ).toBe("comfortable");
  });
});
