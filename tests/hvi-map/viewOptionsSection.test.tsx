// @vitest-environment jsdom

import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import ViewOptionsSection from "../../src/features/hvi-map/components/ViewOptionsSection";

describe("ViewOptionsSection", () => {
  it("renders a compact peripheral areas control with tooltip help", async () => {
    const onShowPeripheralAreasChange = vi.fn();

    render(
      <ViewOptionsSection
        showPeripheralAreas={true}
        onShowPeripheralAreasChange={onShowPeripheralAreasChange}
      />
    );

    expect(screen.getByLabelText("Show peripheral areas")).toBeInTheDocument();
    expect(screen.queryByText("Regional visibility")).not.toBeInTheDocument();

    fireEvent.focus(screen.getByRole("button", { name: "About peripheral areas" }));

    expect(await screen.findByRole("tooltip")).toHaveTextContent(
      /Peripheral areas are mostly lower-population regions/i
    );
  });
});
