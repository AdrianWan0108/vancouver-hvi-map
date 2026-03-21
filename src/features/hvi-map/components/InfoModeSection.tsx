import type { ZoomMode } from "../types/data";

interface InfoModeSectionProps {
  zoomMode: ZoomMode;
}

export default function InfoModeSection({ zoomMode }: InfoModeSectionProps) {
  const message =
    zoomMode === "region"
      ? "Hover a region to preview its summary. Click a region to keep that summary in view, or zoom in to inspect dissemination areas."
      : "Hover a DA to preview its HVI summary. Click a DA to keep that summary in view while exploring the map.";

  const hint =
    zoomMode === "region"
      ? "Use the regional visibility controls when you want to focus on higher-population areas."
      : "The layer, filters, and legend stay pinned below so you can change the map at any time.";

  return (
    <div className="flex flex-1 items-start rounded-lg border border-dashed border-border/80 bg-background/50 p-4">
      <div className="space-y-2">
        <p className="text-sm leading-6 text-muted-foreground">{message}</p>
        <p className="text-xs leading-5 text-muted-foreground/80">{hint}</p>
      </div>
    </div>
  );
}
