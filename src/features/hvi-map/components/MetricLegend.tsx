import type { ReactNode } from "react";
import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { cn } from "@/lib/utils";
import { getPaletteConfig } from "../config/palettes";
import type {
  DaMetricCategory,
  DaMetricFormatId,
  MetricDisplayScaleStrategy,
  MetricPaletteId,
} from "../config/daMetrics";
import {
  formatLegendRangeLabel,
  getLegendRangeClipFlags,
} from "../utils/format";
import HviMethodologySheet from "./HviMethodologySheet";

const DISPLAY_RANGE_NOTE =
  "Colors use a clipped display range to improve contrast across DAs. Filters use the full data range.";

interface MetricLegendProps {
  className?: string;
  label: string;
  paletteId: MetricPaletteId;
  format: DaMetricFormatId;
  displayScaleStrategy: MetricDisplayScaleStrategy;
  displayDomainMin: number;
  displayDomainMax: number;
  category?: DaMetricCategory | string;
  headerAction?: ReactNode;
}

export default function MetricLegend({
  className,
  label,
  paletteId,
  format,
  displayScaleStrategy,
  displayDomainMin,
  displayDomainMax,
  category,
  headerAction,
}: MetricLegendProps) {
  const palette = getPaletteConfig(paletteId);
  const [lowColor, midColor, highColor] = palette.stops;
  const clipFlags = getLegendRangeClipFlags(displayScaleStrategy);

  return (
    <div
      className={cn(
        "grid gap-2 rounded-xl border border-border/90 bg-background/88 p-2.5 shadow-sm backdrop-blur-sm",
        className
      )}
    >
      <div className="grid gap-1.5">
        <div className="flex items-start justify-between gap-2">
          <p className="text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
            Color Scale
          </p>
          <div className="flex items-center gap-1.5">
            {category ? <Badge variant="secondary">{category}</Badge> : null}
            {headerAction}
          </div>
        </div>
        <p className="text-sm font-medium">{label}</p>
      </div>

      <div className="grid gap-1.5">
        <div
          className="h-2.5 rounded-full border border-border/80"
          style={{
            backgroundImage: `linear-gradient(90deg, ${lowColor} 0%, ${midColor} 50%, ${highColor} 100%)`,
          }}
        />
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>{formatLegendRangeLabel(format, displayDomainMin, clipFlags.low, "low")}</span>
          <span>{formatLegendRangeLabel(format, displayDomainMax, clipFlags.high, "high")}</span>
        </div>
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="meaning" className="border-border/70">
            <AccordionTrigger className="py-0 text-[11px]">
              What does this mean?
            </AccordionTrigger>
            <AccordionContent>
              <p className="text-xs leading-5 text-muted-foreground">{palette.description}</p>
              <p className="mt-1.5 text-xs leading-5 text-muted-foreground">
                {DISPLAY_RANGE_NOTE}
              </p>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
        <HviMethodologySheet />
      </div>
    </div>
  );
}
