import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import MetricLegend from "../../src/features/hvi-map/components/MetricLegend";

describe("MetricLegend", () => {
  it("starts with the explanation closed and toggles it with the accordion trigger", () => {
    render(
      <MetricLegend
        label="HVI (0-1)"
        category="HVI"
        paletteId="risk"
        format="score"
        domainMin={0.065}
        domainMax={0.734}
      />
    );

    expect(screen.getByRole("button", { name: /What does this mean\\?/i })).toHaveAttribute(
      "aria-expanded",
      "false"
    );
    expect(screen.getByText("How HVI is built")).toBeInTheDocument();
    expect(
      screen.queryByText("Higher values indicate greater heat vulnerability or risk.")
    ).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /What does this mean\\?/i }));

    expect(screen.getByRole("button", { name: /What does this mean\\?/i })).toHaveAttribute(
      "aria-expanded",
      "true"
    );
    expect(
      screen.getByText("Higher values indicate greater heat vulnerability or risk.")
    ).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /What does this mean\\?/i }));

    expect(
      screen.queryByText("Higher values indicate greater heat vulnerability or risk.")
    ).not.toBeInTheDocument();
  });
});
