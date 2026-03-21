import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

function readIndexCss(): string {
  return readFileSync(path.resolve("src/index.css"), "utf8");
}

describe("tooltip styles", () => {
  it("keeps the tooltip centered and makes the numeric value dominant", () => {
    const css = readIndexCss();

    expect(css).toContain(".map-tooltip {");
    expect(css).toContain("justify-items: center;");
    expect(css).toContain("text-align: center;");
    expect(css).toContain("min-width: 9rem;");
    expect(css).toContain(".map-tooltip__value {");
    expect(css).toContain("font-size: 1.25rem;");
    expect(css).toContain("font-weight: 700;");
  });
});
