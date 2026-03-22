import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import FilterMenu from "../../src/features/hvi-map/components/FilterMenu";
import { MapStateProvider } from "../../src/features/hvi-map/state/MapStateProvider";

describe("FilterMenu", () => {
  it("shows the full-range clarification note inside the popover", () => {
    render(
      <MapStateProvider>
        <FilterMenu />
      </MapStateProvider>
    );

    fireEvent.click(screen.getByRole("button", { name: "Filter" }));

    expect(
      screen.getByText(
        "Filters use full metric ranges. Map colors may use clipped display ranges for contrast."
      )
    ).toBeInTheDocument();
  });
});
