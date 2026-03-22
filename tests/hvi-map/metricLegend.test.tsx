import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import MetricLegend from "../../src/features/hvi-map/components/MetricLegend";

describe("MetricLegend", () => {
  it("starts with the explanation closed and toggles it with the accordion trigger", () => {
    render(
      <MetricLegend
        label="HVI (0-1)"
        category="HVI"
        paletteId="hvi"
        format="score3"
        displayScaleStrategy="p05-p95"
        displayDomainMin={0.23931}
        displayDomainMax={0.52972}
      />
    );

    expect(screen.getByText("< 0.239")).toBeInTheDocument();
    expect(screen.getByText("> 0.530")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /What does this mean\\?/i })).toHaveAttribute(
      "aria-expanded",
      "false"
    );
    expect(screen.getByText("How HVI is built")).toBeInTheDocument();
    expect(
      screen.queryByText("Higher values indicate greater overall heat vulnerability.")
    ).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /What does this mean\\?/i }));

    expect(screen.getByRole("button", { name: /What does this mean\\?/i })).toHaveAttribute(
      "aria-expanded",
      "true"
    );
    expect(
      screen.getByText("Higher values indicate greater overall heat vulnerability.")
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        "Colors use a clipped display range to improve contrast across DAs. Filters use the full data range."
      )
    ).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /What does this mean\\?/i }));

    expect(
      screen.queryByText("Higher values indicate greater overall heat vulnerability.")
    ).not.toBeInTheDocument();
  });

  it("keeps the zero low label exact for zero-p95 metrics while clipping the high label", () => {
    render(
      <MetricLegend
        label="Major Repairs"
        category="Housing"
        paletteId="housing"
        format="percent1"
        displayScaleStrategy="zero-p95"
        displayDomainMin={0}
        displayDomainMax={13.636364}
      />
    );

    expect(screen.getByText("0.0%")).toBeInTheDocument();
    expect(screen.getByText("> 13.6%")).toBeInTheDocument();
  });
});
