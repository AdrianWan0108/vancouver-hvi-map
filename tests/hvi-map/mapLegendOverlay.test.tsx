import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { MapStateContext } from "../../src/features/hvi-map/state/context";
import { createInitialMapUiState } from "../../src/features/hvi-map/state/reducer";
import MapLegendOverlay from "../../src/features/hvi-map/components/MapLegendOverlay";

function setViewport(width: number, height: number) {
  Object.defineProperty(window, "innerWidth", {
    configurable: true,
    writable: true,
    value: width,
  });
  Object.defineProperty(window, "innerHeight", {
    configurable: true,
    writable: true,
    value: height,
  });
}

function renderWithState(zoomMode: "da" | "region" = "da") {
  const state = {
    ...createInitialMapUiState(),
    zoomMode,
  };

  return render(
    <MapStateContext.Provider value={{ state, dispatch: () => undefined }}>
      <MapLegendOverlay />
    </MapStateContext.Provider>
  );
}

describe("MapLegendOverlay", () => {
  it("renders the expanded color scale by default on large desktop viewports", () => {
    setViewport(1680, 980);
    renderWithState("da");

    expect(screen.getByText("Color Scale")).toBeInTheDocument();
    expect(screen.getByText("HVI (0-1)")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Hide color scale/i })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /Show color scale/i })).not.toBeInTheDocument();
  });

  it("renders the minimized pill by default on tighter viewports and expands on click", () => {
    setViewport(1280, 780);
    renderWithState("da");

    expect(screen.getByRole("button", { name: /Show color scale/i })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /Hide color scale/i })).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /Show color scale/i }));

    expect(screen.getByRole("button", { name: /Hide color scale/i })).toBeInTheDocument();
    expect(screen.getByText("How HVI is built")).toBeInTheDocument();
  });

  it("collapses the expanded legend back to the minimized pill", () => {
    setViewport(1680, 980);
    renderWithState("da");

    fireEvent.click(screen.getByRole("button", { name: /Hide color scale/i }));

    expect(screen.getByRole("button", { name: /Show color scale/i })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /Hide color scale/i })).not.toBeInTheDocument();
  });

  it("switches to the region legend in region mode", () => {
    setViewport(1680, 980);
    renderWithState("region");

    expect(screen.getByText("Region")).toBeInTheDocument();
  });
});
