import type { ZoomMode } from "../types/data";

interface InfoModeSectionProps {
  zoomMode: ZoomMode;
  hasLockedDa: boolean;
}

export default function InfoModeSection({
  zoomMode,
  hasLockedDa,
}: InfoModeSectionProps) {
  const message =
    zoomMode === "region"
      ? hasLockedDa
        ? "Regional view is active. Zoom in to DA level to resume the locked DA panel."
        : "Regional view is active. Zoom in to DA level to inspect DA details."
      : "Hover a DA to see details. Click a DA to lock the panel.";

  const hint =
    zoomMode === "region"
      ? "The panel height stays pinned so the map layout does not jump while you change zoom levels."
      : "Locking a DA keeps its metrics visible while you continue exploring the map.";

  if (zoomMode === "region") {
    return (
      <div className="flex flex-1 items-start rounded-lg border border-dashed border-border/80 bg-background/50 p-4">
        <div className="space-y-2">
          <p className="text-sm leading-6 text-muted-foreground">{message}</p>
          <p className="text-xs leading-5 text-muted-foreground/80">{hint}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-1 items-start rounded-lg border border-dashed border-border/80 bg-background/50 p-4">
      <div className="space-y-2">
        <p className="text-sm leading-6 text-muted-foreground">{message}</p>
        <p className="text-xs leading-5 text-muted-foreground/80">{hint}</p>
      </div>
    </div>
  );
}
