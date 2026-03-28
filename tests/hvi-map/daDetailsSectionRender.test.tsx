import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import DaDetailsSection from "../../src/features/hvi-map/components/DaDetailsSection";
import type { DaFeatureProperties } from "../../src/features/hvi-map/types/data";

const da: DaFeatureProperties = {
  DGUID: "2021S051259150688",
  DAUID: "59150688",
  hvi_index_n01: 0.402,
  sensitivity_index: 0.127,
  adaptive_capacity_index: 0.646,
  exposure_index: 0.725,
  exposure_mean: 28.9,
  hardscape_frac: 0.612,
  frac_buildings: 0.121,
  frac_paved: 0.333,
  frac_other_built: 0.158,
  unemployment_rate: 6.2,
  low_income_rate: 14.8,
  pct_seniors_65plus: 9.3,
  pct_living_alone: 18.1,
  green_frac: 0.441,
  pct_renter: 37.2,
  pct_major_repairs: 4.4,
  pct_core_need: 9.8,
  frac_coniferous: 0.051,
  frac_deciduous: 0.301,
  frac_shrub: 0.089,
};

function setMatchMedia(matches: boolean) {
  Object.defineProperty(window, "matchMedia", {
    writable: true,
    value: vi.fn().mockImplementation(() => ({
      matches,
      media: "(min-width: 768px)",
      onchange: null,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  });
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe("DaDetailsSection", () => {
  it("shows the HVI summary and keeps all component cards closed by default", () => {
    render(<DaDetailsSection da={da} />);

    expect(screen.getByText("HVI Summary")).toBeInTheDocument();
    expect(screen.getByText("Exposure (E)")).toBeInTheDocument();
    expect(screen.getByText("Sensitivity (S)")).toBeInTheDocument();
    expect(screen.getByText("Adaptive Capacity (A)")).toBeInTheDocument();
    expect(screen.getAllByText("Normalized value")).toHaveLength(3);
    expect(
      screen.getByRole("progressbar", { name: /Exposure \(E\) normalized value/i })
    ).toBeInTheDocument();
    expect(screen.queryByText("67% Temperature")).not.toBeInTheDocument();
    expect(screen.queryByText("25% Living alone")).not.toBeInTheDocument();
    expect(screen.queryByText("25% Green")).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Explain HVI summary/i })).toBeInTheDocument();
    expect(
      screen.queryByText("Display bars use current map display ranges for visual comparison only.")
    ).not.toBeInTheDocument();
    expect(
      screen.queryByText(
        "Higher Exposure and Sensitivity raise HVI, while higher Adaptive Capacity lowers it."
      )
    ).not.toBeInTheDocument();
  });

  it("opens component details inline on small screens", () => {
    render(<DaDetailsSection da={da} />);

    const exposureButton = screen.getByRole("button", { name: /Exposure \(E\)/i });
    const closedChevron = exposureButton.querySelector("svg");

    expect(closedChevron).toHaveClass("rotate-180");

    fireEvent.click(exposureButton);

    const openChevron = screen
      .getByRole("button", { name: /Exposure \(E\)/i })
      .querySelector("svg");

    expect(openChevron).not.toHaveClass("rotate-180");
    expect(screen.getByText("Primary inputs")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /About these bars/i })
    ).toBeInTheDocument();
    expect(
      screen.queryByText(
        "Mini bars use observed data ranges for comparison only. Map colors and legends use clipped display ranges for stronger contrast."
      )
    ).not.toBeInTheDocument();

    fireEvent.focus(screen.getByRole("button", { name: /About these bars/i }));

    expect(
      screen.getByText(
        "Mini bars use observed data ranges for comparison only. Map colors and legends use clipped display ranges for stronger contrast."
      )
    ).toBeInTheDocument();
  });

  it("switches the desktop flyout when different components are selected", () => {
    setMatchMedia(true);
    render(<DaDetailsSection da={da} />);

    fireEvent.click(screen.getByRole("button", { name: /Exposure \(E\)/i }));
    expect(screen.getByRole("button", { name: /Close component details/i })).toBeInTheDocument();
    expect(screen.getByText("Hardscape breakdown")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /Sensitivity \(S\)/i }));
    expect(screen.getByText("Equal contributors")).toBeInTheDocument();
    expect(screen.queryByText("Hardscape breakdown")).not.toBeInTheDocument();
  });

  it("keeps the open component stable when the hovered DA changes", () => {
    const { rerender } = render(<DaDetailsSection da={da} />);

    fireEvent.click(screen.getByRole("button", { name: /Exposure \(E\)/i }));
    expect(screen.getByText("Primary inputs")).toBeInTheDocument();

    rerender(
      <DaDetailsSection
        da={{
          ...da,
          DGUID: "2021S051259150689",
          DAUID: "59150689",
          exposure_index: 0.541,
        }}
      />
    );

    expect(screen.getByText("Primary inputs")).toBeInTheDocument();
  });

  it("reveals the HVI summary note through the help tooltip", () => {
    render(<DaDetailsSection da={da} />);

    const helpTrigger = screen.getByRole("button", { name: /Explain HVI summary/i });

    fireEvent.focus(helpTrigger);

    expect(
      screen.getByText(
        "Higher Exposure and Sensitivity raise HVI, while higher Adaptive Capacity lowers it."
      )
    ).toBeInTheDocument();
  });
});
