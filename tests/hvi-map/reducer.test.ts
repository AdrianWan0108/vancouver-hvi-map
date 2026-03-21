import { describe, expect, it } from "vitest";
import { createInitialMapUiState, mapUiReducer } from "../../src/features/hvi-map/state/reducer";
import type {
  DaFeatureProperties,
  RegionFeatureProperties,
} from "../../src/features/hvi-map/types/data";

function makeDa(dguid: string, dauid = dguid): DaFeatureProperties {
  return { DGUID: dguid, DAUID: dauid, hvi_index_n01: 0.5 };
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
    expect(initial.filters.hvi_index_n01.min).toBe(0.06462950439663971);
    expect(initial.filters.hvi_index_n01.max).toBe(0.733616020899424);
  });

  it("locks, unlocks, and switches lock on DA clicks", () => {
    const daA = makeDa("A");
    const daB = makeDa("B");

    const initial = createInitialMapUiState();
    const inDaMode = mapUiReducer(initial, {
      type: "zoomModeChanged",
      zoomMode: "da",
    });

    const lockedA = mapUiReducer(inDaMode, {
      type: "daClicked",
      da: daA,
      regionName: "Metro Core",
    });
    expect(lockedA.lockedDa?.DGUID).toBe("A");
    expect(lockedA.lockedDaRegionName).toBe("Metro Core");

    const switchedToB = mapUiReducer(lockedA, {
      type: "daClicked",
      da: daB,
      regionName: "North Shore",
    });
    expect(switchedToB.lockedDa?.DGUID).toBe("B");
    expect(switchedToB.lockedDaRegionName).toBe("North Shore");

    const unlocked = mapUiReducer(switchedToB, {
      type: "daClicked",
      da: daB,
      regionName: "North Shore",
    });
    expect(unlocked.lockedDa).toBeNull();
    expect(unlocked.hoveredDa?.DGUID).toBe("B");
    expect(unlocked.hoveredDaRegionName).toBe("North Shore");
  });

  it("clears hover but preserves lock when leaving DA mode", () => {
    const daA = makeDa("A");

    const initial = createInitialMapUiState();
    const inDaMode = mapUiReducer(initial, {
      type: "zoomModeChanged",
      zoomMode: "da",
    });
    const hovered = mapUiReducer(inDaMode, {
      type: "hoveredDaChanged",
      da: daA,
      regionName: "Metro Core",
    });
    const locked = mapUiReducer(hovered, {
      type: "daClicked",
      da: daA,
      regionName: "Metro Core",
    });
    const backToRegion = mapUiReducer(locked, {
      type: "zoomModeChanged",
      zoomMode: "region",
    });

    expect(backToRegion.hoveredDa).toBeNull();
    expect(backToRegion.hoveredDaRegionName).toBeNull();
    expect(backToRegion.lockedDa?.DGUID).toBe("A");
    expect(backToRegion.lockedDaRegionName).toBe("Metro Core");
  });

  it("normalizes and clamps filter ranges", () => {
    const initial = createInitialMapUiState();

    const normalized = mapUiReducer(initial, {
      type: "filterRangeChanged",
      metricId: "exposure_mean",
      min: 30,
      max: 20,
    });

    expect(normalized.filters.exposure_mean.min).toBe(20);
    expect(normalized.filters.exposure_mean.max).toBe(30);

    const clamped = mapUiReducer(normalized, {
      type: "filterRangeChanged",
      metricId: "hvi_index_n01",
      min: -5,
      max: 99,
    });

    expect(clamped.filters.hvi_index_n01.min).toBe(0.06462950439663971);
    expect(clamped.filters.hvi_index_n01.max).toBe(0.733616020899424);
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
    const hoveredDa = mapUiReducer(inDaMode, {
      type: "hoveredDaChanged",
      da,
      regionName: "Alpha",
    });
    const lockedDa = mapUiReducer(hoveredDa, {
      type: "daClicked",
      da,
      regionName: "Alpha",
    });
    const backToRegion = mapUiReducer(lockedDa, {
      type: "zoomModeChanged",
      zoomMode: "region",
    });

    expect(backToRegion.lockedDa?.DGUID).toBe("A");
    expect(backToRegion.lockedDaRegionName).toBe("Alpha");
    expect(backToRegion.lockedRegion?.FullName).toBe("Alpha");
    expect(backToRegion.hoveredDa).toBeNull();
    expect(backToRegion.hoveredDaRegionName).toBeNull();
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
