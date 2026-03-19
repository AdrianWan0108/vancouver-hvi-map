import { Badge } from "@/components/ui/badge";
import { getPaletteConfig } from "../config/palettes";
import type { DaMetricCategory, DaMetricFormatId, MetricPaletteId } from "../config/daMetrics";
import { formatValueByFormat } from "../utils/format";
import HviMethodologySheet from "./HviMethodologySheet";

interface MetricLegendProps {
  label: string;
  paletteId: MetricPaletteId;
  format: DaMetricFormatId;
  domainMin: number;
  domainMax: number;
  category?: DaMetricCategory | string;
}

export default function MetricLegend({
  label,
  paletteId,
  format,
  domainMin,
  domainMax,
  category,
}: MetricLegendProps) {
  const palette = getPaletteConfig(paletteId);
  const [lowColor, midColor, highColor] = palette.stops;

  return (
    <div className="grid gap-3 rounded-xl border bg-muted/30 p-3">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">
            Legend
          </p>
          <p className="text-sm font-medium">{label}</p>
        </div>
        {category ? <Badge variant="secondary">{category}</Badge> : null}
      </div>

      <div className="grid gap-2">
        <div
          className="h-3 rounded-full border border-border/80"
          style={{
            backgroundImage: `linear-gradient(90deg, ${lowColor} 0%, ${midColor} 50%, ${highColor} 100%)`,
          }}
        />
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>{formatValueByFormat(format, domainMin)}</span>
          <span>{formatValueByFormat(format, domainMax)}</span>
        </div>
        <p className="text-xs leading-5 text-muted-foreground">{palette.description}</p>
        <HviMethodologySheet />
      </div>
    </div>
  );
}
