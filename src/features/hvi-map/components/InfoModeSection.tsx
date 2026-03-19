import type { ZoomMode } from "../types/data";

interface InfoModeSectionProps {
  zoomMode: ZoomMode;
  hasLockedDa: boolean;
  hasLockedRegion: boolean;
}

export default function InfoModeSection({
  zoomMode,
  hasLockedDa,
  hasLockedRegion,
}: InfoModeSectionProps) {
  const message =
    zoomMode === "region"
      ? hasLockedRegion
        ? "Regional view is active. Unlock the current region or zoom in to inspect dissemination areas."
        : "Hover a region to preview its summary. Click a region to lock it, or zoom in to inspect dissemination areas."
      : "Hover a DA to see details. Click a DA to lock the panel.";

  const hint =
    zoomMode === "region"
      ? hasLockedDa
        ? "A DA can stay locked in the background while you check regional summaries and then resume it by zooming back in."
        : "Use the view options to hide low-population peripheral regions without removing them from the data."
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
