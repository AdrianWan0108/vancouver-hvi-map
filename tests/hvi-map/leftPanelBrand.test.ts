import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import LeftPanelBrand from "../../src/features/hvi-map/components/LeftPanelBrand";

describe("LeftPanelBrand", () => {
  it("renders the HeatScope Van lockup with icon and wordmark", () => {
    const markup = renderToStaticMarkup(createElement(LeftPanelBrand));

    expect(markup).toContain('alt="HeatScope Van icon"');
    expect(markup).toContain("<img");
    expect(markup).toContain("Heat");
    expect(markup).toContain("Scope Van");
    expect(markup).toContain("Van");
  });
});
