import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

describe("index.html branding", () => {
  it("uses the HeatScope title and tab icon", () => {
    const html = readFileSync(resolve(process.cwd(), "index.html"), "utf8");

    expect(html).toContain('<link rel="icon" type="image/png" href="/map_icon.png" />');
    expect(html).toContain("<title>HeatScope Van</title>");
  });
});
