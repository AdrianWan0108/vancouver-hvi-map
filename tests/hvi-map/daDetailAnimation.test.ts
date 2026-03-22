import { describe, expect, it } from "vitest";
import {
  DETAIL_ROW_ANIMATION_DURATION_MS,
  easeOutCubic,
  formatAnimatedMetricValue,
  getDetailRowAnimationProgress,
} from "../../src/features/hvi-map/components/daDetailAnimation";

describe("DA detail animation helpers", () => {
  it("eases progress from 0 to 1 and respects reduced motion", () => {
    expect(easeOutCubic(0)).toBe(0);
    expect(easeOutCubic(1)).toBe(1);

    expect(
      getDetailRowAnimationProgress({
        elapsedMs: 10,
        delayMs: 50,
        reducedMotion: true,
      })
    ).toBe(1);

    expect(
      getDetailRowAnimationProgress({
        elapsedMs: 10,
        delayMs: 50,
      })
    ).toBe(0);

    expect(
      getDetailRowAnimationProgress({
        elapsedMs: 50 + DETAIL_ROW_ANIMATION_DURATION_MS,
        delayMs: 50,
      })
    ).toBe(1);
  });

  it("formats animated values with the existing metric format rules", () => {
    expect(
      formatAnimatedMetricValue({
        format: "integer",
        numericValue: 1565,
        progress: 0.5,
        fallbackValue: "1,565",
      })
    ).toBe("783");

    expect(
      formatAnimatedMetricValue({
        format: "percent1",
        numericValue: 18.1,
        progress: 0.5,
        fallbackValue: "18.1%",
      })
    ).toBe("9.1%");

    expect(
      formatAnimatedMetricValue({
        format: "score3",
        numericValue: 0.612,
        progress: 1,
        fallbackValue: "0.612",
      })
    ).toBe("0.612");
  });
});
