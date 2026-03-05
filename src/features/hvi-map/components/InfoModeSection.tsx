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
      <div style={{ color: "rgba(0,0,0,0.72)" }}>
        {hasLockedDa
          ? "Regional view is active. Zoom in to DA level to resume the locked DA panel."
          : "Regional view is active. Zoom in to DA level to inspect DA details."}
      </div>
    );
  }

  return (
    <div style={{ color: "rgba(0,0,0,0.72)" }}>
      Hover a DA to see details. Click a DA to lock the panel.
    </div>
  );
}
