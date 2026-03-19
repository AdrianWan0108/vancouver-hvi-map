import { describe, expect, it } from "vitest";
import { createInitialMapUiState, mapUiReducer } from "../../src/features/hvi-map/state/reducer";
import {
  selectActiveDa,
  selectActiveRegion,
  selectIsLockedDaFilteredOut,
  selectPanelMode,
} from "../../src/features/hvi-map/state/selectors";

describe("selectors", () => {
  it("derives panel mode from zoom + lock + hover state", () => {
    const initial = createInitialMapUiState();
    expect(selectPanelMode(initial)).toBe("info");

    const hoveredRegion = mapUiReducer(initial, {
      type: "hoveredRegionChanged",
      region: { MunNum: 1, FullName: "Alpha" },
    });
    expect(selectPanelMode(hoveredRegion)).toBe("hover");

    const lockedRegion = mapUiReducer(hoveredRegion, {
      type: "regionClicked",
      region: { MunNum: 1, FullName: "Alpha" },
    });
    expect(selectPanelMode(lockedRegion)).toBe("locked");

    const inDa = mapUiReducer(lockedRegion, {
      type: "zoomModeChanged",
      zoomMode: "da",
    });
    const hovered = mapUiReducer(inDa, {
      type: "hoveredDaChanged",
      da: { DGUID: "A" },
    });
    expect(selectPanelMode(hovered)).toBe("hover");

    const locked = mapUiReducer(hovered, {
      type: "daClicked",
      da: { DGUID: "A" },
    });
    expect(selectPanelMode(locked)).toBe("locked");
  });

  it("returns active DA only in DA zoom mode", () => {
    const initial = createInitialMapUiState();
    const inDa = mapUiReducer(initial, { type: "zoomModeChanged", zoomMode: "da" });
    const hovered = mapUiReducer(inDa, {
      type: "hoveredDaChanged",
      da: { DGUID: "A" },
    });
    expect(selectActiveDa(hovered)?.DGUID).toBe("A");

    const inRegion = mapUiReducer(hovered, {
      type: "zoomModeChanged",
      zoomMode: "region",
    });
    expect(selectActiveDa(inRegion)).toBeNull();
  });

  it("returns active region only in region zoom mode", () => {
    const initial = createInitialMapUiState();
    const hovered = mapUiReducer(initial, {
      type: "hoveredRegionChanged",
      region: { MunNum: 1, FullName: "Alpha" },
    });
    expect(selectActiveRegion(hovered)?.FullName).toBe("Alpha");

    const inDa = mapUiReducer(hovered, {
      type: "zoomModeChanged",
      zoomMode: "da",
    });
    expect(selectActiveRegion(inDa)).toBeNull();
  });

  it("flags locked DA as filtered out when outside active filter", () => {
    const initial = createInitialMapUiState();
    const inDa = mapUiReducer(initial, { type: "zoomModeChanged", zoomMode: "da" });
    const locked = mapUiReducer(inDa, {
      type: "daClicked",
      da: { DGUID: "A", hvi_index_n01: 0.2 },
    });
    const filtered = mapUiReducer(locked, {
      type: "filterRangeChanged",
      metricId: "hvi_index_n01",
      min: 0.4,
      max: 1,
    });

    expect(selectIsLockedDaFilteredOut(filtered)).toBe(true);
  });
});
