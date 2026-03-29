import { CircleHelpIcon } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface ViewOptionsSectionProps {
  showPeripheralAreas: boolean;
  onShowPeripheralAreasChange: (showPeripheralAreas: boolean) => void;
}

export default function ViewOptionsSection({
  showPeripheralAreas,
  onShowPeripheralAreasChange,
}: ViewOptionsSectionProps) {
  return (
    <div className="flex items-center justify-between rounded-xl border bg-muted/20 px-2 py-1.5">
      <Label
        htmlFor="show-peripheral-areas"
        className="flex min-w-0 items-center gap-1.5 text-[12px] font-medium"
      >
        <Checkbox
          id="show-peripheral-areas"
          className="h-3 w-3"
          checked={showPeripheralAreas}
          onChange={(event) =>
            onShowPeripheralAreasChange(event.currentTarget.checked)
          }
        />
        <span className="truncate">Show peripheral areas</span>
      </Label>

      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              type="button"
              className="inline-flex size-5 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent/60 hover:text-foreground focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] focus-visible:outline-none"
              aria-label="About peripheral areas"
            >
              <CircleHelpIcon className="size-3" />
            </button>
          </TooltipTrigger>
          <TooltipContent side="top" className="max-w-72">
            Peripheral areas are mostly lower-population regions. Some special
            regions, including Electoral Area A, can also be included. This
            setting affects both region view and the DAs inside those regions.
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
}
