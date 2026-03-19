import { describe, expect, it } from "vitest";
import { createInitialMapUiState, mapUiReducer } from "../../src/features/hvi-map/state/reducer";
import type {
  DaFeatureProperties,
  RegionFeatureProperties,
} from "../../src/features/hvi-map/types/data";

function makeDa(dguid: string): DaFeatureProperties {
  return { DGUID: dguid, hvi_index_n01: 0.5 };
}

function makeRegion(munNum: number, name = `Region ${munNum}`): RegionFeatureProperties {
  return {
    MunNum: munNum,
    FullName: name,
    region_hvi_n01: 0.4,
    region_pop_total: 12000,
    da_count_used: 14,
  };
}

describe("mapUiReducer", () => {
  it("defaults to showing peripheral regions", () => {
    const initial = createInitialMapUiState();
    expect(initial.showPeripheralAreas).toBe(true);
  });

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

  it("locks, unlocks, and switches lock on region clicks", () => {
    const regionA = makeRegion(1, "Alpha");
    const regionB = makeRegion(2, "Beta");
    const initial = createInitialMapUiState();

    const hovered = mapUiReducer(initial, {
      type: "hoveredRegionChanged",
      region: regionA,
    });
    expect(hovered.hoveredRegion?.FullName).toBe("Alpha");

    const lockedA = mapUiReducer(hovered, {
      type: "regionClicked",
      region: regionA,
    });
    expect(lockedA.lockedRegion?.FullName).toBe("Alpha");

    const switchedToB = mapUiReducer(lockedA, {
      type: "regionClicked",
      region: regionB,
    });
    expect(switchedToB.lockedRegion?.FullName).toBe("Beta");

    const unlocked = mapUiReducer(switchedToB, {
      type: "regionClicked",
      region: regionB,
    });
    expect(unlocked.lockedRegion).toBeNull();
    expect(unlocked.hoveredRegion?.FullName).toBe("Beta");
  });

  it("preserves DA and region locks across zoom changes while clearing hover state", () => {
    const da = makeDa("A");
    const region = makeRegion(1, "Alpha");
    const initial = createInitialMapUiState();
    const lockedRegion = mapUiReducer(initial, {
      type: "regionClicked",
      region,
    });
    const inDaMode = mapUiReducer(lockedRegion, {
      type: "zoomModeChanged",
      zoomMode: "da",
    });
    const hoveredDa = mapUiReducer(inDaMode, { type: "hoveredDaChanged", da });
    const lockedDa = mapUiReducer(hoveredDa, { type: "daClicked", da });
    const backToRegion = mapUiReducer(lockedDa, {
      type: "zoomModeChanged",
      zoomMode: "region",
    });

    expect(backToRegion.lockedDa?.DGUID).toBe("A");
    expect(backToRegion.lockedRegion?.FullName).toBe("Alpha");
    expect(backToRegion.hoveredDa).toBeNull();
    expect(backToRegion.hoveredRegion).toBeNull();
  });

  it("toggles peripheral visibility", () => {
    const initial = createInitialMapUiState();
    const hiddenPeripheral = mapUiReducer(initial, {
      type: "peripheralVisibilityChanged",
      showPeripheralAreas: false,
    });

    expect(hiddenPeripheral.showPeripheralAreas).toBe(false);
  });
});
