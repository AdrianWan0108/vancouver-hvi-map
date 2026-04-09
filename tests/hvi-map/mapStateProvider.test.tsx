// @vitest-environment jsdom

import { useEffect, type Dispatch } from "react";
import { act, render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { MapStateProvider } from "../../src/features/hvi-map/state/MapStateProvider";
import { useMapDispatch } from "../../src/features/hvi-map/state/useMapDispatch";
import { useMapHoverState } from "../../src/features/hvi-map/state/useMapHoverState";
import { useMapUiState } from "../../src/features/hvi-map/state/useMapUiState";
import type { MapAction } from "../../src/features/hvi-map/types/state";

describe("MapStateProvider", () => {
  it("keeps UI-only and dispatch-only consumers stable across hover updates", () => {
    let uiRenderCount = 0;
    let hoverRenderCount = 0;
    let dispatchRenderCount = 0;
    let dispatchRef: Dispatch<MapAction> | null = null;

    function UiOnlyConsumer({ onRender }: { onRender: () => void }) {
      const state = useMapUiState();
      useEffect(() => {
        onRender();
      });
      return <div>{state.selectedMetric}</div>;
    }

    function HoverOnlyConsumer({ onRender }: { onRender: () => void }) {
      const state = useMapHoverState();
      useEffect(() => {
        onRender();
      });
      return <div>{state.hoveredDa?.DGUID ?? "none"}</div>;
    }

    function DispatchOnlyConsumer({
      onRender,
      onDispatch,
    }: {
      onRender: () => void;
      onDispatch: (dispatch: Dispatch<MapAction>) => void;
    }) {
      const dispatch = useMapDispatch();
      useEffect(() => {
        onRender();
        onDispatch(dispatch);
      }, [dispatch, onDispatch, onRender]);
      return null;
    }

    render(
      <MapStateProvider>
        <UiOnlyConsumer onRender={() => uiRenderCount += 1} />
        <HoverOnlyConsumer onRender={() => hoverRenderCount += 1} />
        <DispatchOnlyConsumer
          onRender={() => dispatchRenderCount += 1}
          onDispatch={(dispatch) => {
            dispatchRef = dispatch;
          }}
        />
      </MapStateProvider>
    );

    expect(uiRenderCount).toBe(1);
    expect(hoverRenderCount).toBe(1);
    expect(dispatchRenderCount).toBe(1);

    act(() => {
      dispatchRef?.({
        type: "hoveredDaChanged",
        da: { DGUID: "A", DAUID: "A" },
        regionName: "Metro Core",
      });
    });

    expect(uiRenderCount).toBe(1);
    expect(hoverRenderCount).toBe(2);
    expect(dispatchRenderCount).toBe(1);

    act(() => {
      dispatchRef?.({
        type: "selectedMetricChanged",
        metricId: "exposure_index",
      });
    });

    expect(uiRenderCount).toBe(2);
    expect(hoverRenderCount).toBe(2);
    expect(dispatchRenderCount).toBe(1);
  });
});
