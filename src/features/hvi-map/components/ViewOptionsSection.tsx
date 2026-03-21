import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import type { ZoomMode } from "../types/data";
import {
  getPeripheralVisibilityDescription,
  isPeripheralVisibilityControlDisabled,
} from "./panelContent";

interface ViewOptionsSectionProps {
  zoomMode: ZoomMode;
  showPeripheralAreas: boolean;
  onShowPeripheralAreasChange: (showPeripheralAreas: boolean) => void;
}

export default function ViewOptionsSection({
  zoomMode,
  showPeripheralAreas,
  onShowPeripheralAreasChange,
}: ViewOptionsSectionProps) {
  const isDisabled = isPeripheralVisibilityControlDisabled(zoomMode);
  const description = getPeripheralVisibilityDescription(zoomMode);

  return (
    <div className="grid gap-3 rounded-xl border bg-muted/30 p-3">
      <div>
        <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">
          View Options
        </p>
        <p className="text-sm font-medium">Regional visibility</p>
      </div>

      <Label className="flex items-start gap-3 text-sm font-medium">
        <Checkbox
          id="show-peripheral-areas"
          checked={showPeripheralAreas}
          disabled={isDisabled}
          onChange={(event) =>
            onShowPeripheralAreasChange(event.currentTarget.checked)
          }
        />
        <span className="grid gap-1">
          <span>Show peripheral areas</span>
          <span className="text-xs font-normal leading-5 text-muted-foreground">
            {description}
          </span>
        </span>
      </Label>
    </div>
  );
}
