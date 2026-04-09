import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import LeftPanelLabLogo from "../../src/features/hvi-map/components/LeftPanelLabLogo";

describe("LeftPanelLabLogo", () => {
  it("renders the STAR lab logo image", () => {
    const markup = renderToStaticMarkup(createElement(LeftPanelLabLogo));

    expect(markup).toContain('alt="STAR research lab logo"');
    expect(markup).toContain("<img");
  });
});
