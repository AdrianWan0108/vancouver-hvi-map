import { describe, expect, it } from "vitest";
import { createInitialMapUiState, mapUiReducer } from "../../src/features/hvi-map/state/reducer";
import {
  selectActiveDa,
  selectIsLockedDaFilteredOut,
  selectPanelMode,
} from "../../src/features/hvi-map/state/selectors";

describe("selectors", () => {
  it("derives panel mode from zoom + lock + hover state", () => {
    const initial = createInitialMapUiState();
    expect(selectPanelMode(initial)).toBe("info");

    const inDa = mapUiReducer(initial, { type: "zoomModeChanged", zoomMode: "da" });
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
