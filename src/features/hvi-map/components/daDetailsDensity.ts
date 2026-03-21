export type PanelDensity = "comfortable" | "compact" | "ultra";

export function resolvePanelDensity({
  isDesktop,
  viewportHeight,
  isOverflowing,
}: {
  isDesktop: boolean;
  viewportHeight: number;
  isOverflowing: boolean;
}): PanelDensity {
  if (!isDesktop) {
    return "comfortable";
  }

  let density: PanelDensity = "comfortable";

  if (viewportHeight <= 800) {
    density = "compact";
  }

  if (viewportHeight <= 680) {
    density = "ultra";
  }

  if (isOverflowing && density === "comfortable") {
    density = "compact";
  } else if (isOverflowing && density === "compact" && viewportHeight <= 640) {
    density = "ultra";
  }

  return density;
}
