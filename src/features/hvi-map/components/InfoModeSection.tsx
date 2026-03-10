import type { ZoomMode } from "../types/data";

interface InfoModeSectionProps {
  zoomMode: ZoomMode;
  hasLockedDa: boolean;
}

export default function InfoModeSection({
  zoomMode,
  hasLockedDa,
}: InfoModeSectionProps) {
  if (zoomMode === "region") {
    return (
      <p className="text-sm leading-6 text-muted-foreground">
        {hasLockedDa
          ? "Regional view is active. Zoom in to DA level to resume the locked DA panel."
          : "Regional view is active. Zoom in to DA level to inspect DA details."}
      </p>
    );
  }

  return (
    <p className="text-sm leading-6 text-muted-foreground">
      Hover a DA to see details. Click a DA to lock the panel.
    </p>
  );
}
