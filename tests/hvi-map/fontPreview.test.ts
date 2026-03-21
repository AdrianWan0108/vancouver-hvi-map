import { describe, expect, it } from "vitest";
import {
  FONT_PREVIEW_OPTIONS,
  FONT_PREVIEW_STORAGE_KEY,
  getFontPreviewOption,
  isFontPreviewId,
} from "../../src/features/hvi-map/config/fontPreview";

describe("font preview config", () => {
  it("defines the system baseline and all preview font candidates", () => {
    expect(FONT_PREVIEW_OPTIONS.map((option) => option.label)).toEqual([
      "System",
      "Inter",
      "IBM Plex Sans",
      "Space Grotesque",
      "Public Sans",
      "Fira Sans",
      "Manrope",
      "JetBrains Mono",
    ]);
    expect(FONT_PREVIEW_STORAGE_KEY).toBe("hvi-font-preview");
  });

  it("validates ids and falls back to the system option when needed", () => {
    expect(isFontPreviewId("system")).toBe(true);
    expect(isFontPreviewId("inter")).toBe(true);
    expect(isFontPreviewId("ibm-plex-sans")).toBe(true);
    expect(isFontPreviewId("space-grotesque")).toBe(true);
    expect(isFontPreviewId("public-sans")).toBe(true);
    expect(isFontPreviewId("fira-sans")).toBe(true);
    expect(isFontPreviewId("manrope")).toBe(true);
    expect(isFontPreviewId("jetbrains-mono")).toBe(true);
    expect(isFontPreviewId("not-a-font")).toBe(false);

    expect(getFontPreviewOption("system").label).toBe("System");
    expect(getFontPreviewOption("manrope").label).toBe("Manrope");
  });
});
