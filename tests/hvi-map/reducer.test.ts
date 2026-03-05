import { describe, expect, it } from "vitest";
import { createInitialMapUiState, mapUiReducer } from "../../src/features/hvi-map/state/reducer";
import type { DaFeatureProperties } from "../../src/features/hvi-map/types/data";

function makeDa(dguid: string): DaFeatureProperties {
  return { DGUID: dguid, hvi_index_n01: 0.5 };
}

describe("mapUiReducer", () => {
  it("locks, unlocks, and switches lock on DA clicks", () => {
    const daA = makeDa("A");
    const daB = makeDa("B");

    const initial = createInitialMapUiState();
    const inDaMode = mapUiReducer(initial, {
      type: "zoomModeChanged",
      zoomMode: "da",
    });

    const lockedA = mapUiReducer(inDaMode, { type: "daClicked", da: daA });
    expect(lockedA.lockedDa?.DGUID).toBe("A");

    const switchedToB = mapUiReducer(lockedA, { type: "daClicked", da: daB });
    expect(switchedToB.lockedDa?.DGUID).toBe("B");

    const unlocked = mapUiReducer(switchedToB, { type: "daClicked", da: daB });
    expect(unlocked.lockedDa).toBeNull();
    expect(unlocked.hoveredDa?.DGUID).toBe("B");
  });

  it("clears hover but preserves lock when leaving DA mode", () => {
    const daA = makeDa("A");

    const initial = createInitialMapUiState();
    const inDaMode = mapUiReducer(initial, {
      type: "zoomModeChanged",
      zoomMode: "da",
    });
    const hovered = mapUiReducer(inDaMode, { type: "hoveredDaChanged", da: daA });
    const locked = mapUiReducer(hovered, { type: "daClicked", da: daA });
    const backToRegion = mapUiReducer(locked, {
      type: "zoomModeChanged",
      zoomMode: "region",
    });

    expect(backToRegion.hoveredDa).toBeNull();
    expect(backToRegion.lockedDa?.DGUID).toBe("A");
  });

  it("normalizes filter ranges and disables filter with empty bounds", () => {
    const initial = createInitialMapUiState();

    const enabledWithBounds = mapUiReducer(initial, {
      type: "filterRangeChanged",
      metricId: "hvi_index_n01",
      min: 0.8,
      max: 0.2,
    });

    expect(enabledWithBounds.filters.hvi_index_n01.min).toBe(0.2);
    expect(enabledWithBounds.filters.hvi_index_n01.max).toBe(0.8);
    expect(enabledWithBounds.filters.hvi_index_n01.enabled).toBe(true);

    const disabledWithEmptyBounds = mapUiReducer(enabledWithBounds, {
      type: "filterRangeChanged",
      metricId: "hvi_index_n01",
      min: null,
      max: null,
    });

    expect(disabledWithEmptyBounds.filters.hvi_index_n01.enabled).toBe(false);
  });
});
