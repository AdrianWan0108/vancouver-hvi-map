import { useEffect, useState } from "react";
import { ChevronDownIcon, ChevronUpIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleTrigger } from "@/components/ui/collapsible";
import { DA_METRICS_BY_ID } from "../config/daMetrics";
import { getPaletteConfig } from "../config/palettes";
import { REGION_HVI_METRIC } from "../config/regionConfig";
import { useMapUiState } from "../state/useMapUiState";
import MetricLegend from "./MetricLegend";

function getLegendViewportMode() {
  if (typeof window === "undefined") {
    return { compact: false };
  }

  return {
    compact: window.innerWidth < 1400 || window.innerHeight < 860,
  };
}

export default function MapLegendOverlay() {
  const state = useMapUiState();
  const activeLegendMetric =
    state.zoomMode === "da"
      ? DA_METRICS_BY_ID[state.selectedMetric]
      : REGION_HVI_METRIC;
  const activeLegendCategory =
    state.zoomMode === "da"
      ? DA_METRICS_BY_ID[state.selectedMetric].category
      : "Region";
  const [legendUi, setLegendUi] = useState(() => {
    const viewportMode = getLegendViewportMode();
    return {
      compact: viewportMode.compact,
      open: !viewportMode.compact,
    };
  });

  useEffect(() => {
    if (typeof window === "undefined") {
      return undefined;
    }

    const onResize = () => {
      const viewportMode = getLegendViewportMode();
      setLegendUi((current) =>
        current.compact === viewportMode.compact
          ? current
          : {
              compact: viewportMode.compact,
              open: !viewportMode.compact,
            }
      );
    };

    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const setOpen = (open: boolean) => {
    setLegendUi((current) => ({ ...current, open }));
  };

  const palette = getPaletteConfig(activeLegendMetric.paletteId);
  const [lowColor, midColor, highColor] = palette.stops;

  return (
    <div className="pointer-events-none absolute right-4 bottom-4 z-10">
      <div className="pointer-events-auto relative ml-auto flex justify-end">
        <Collapsible open={legendUi.open} onOpenChange={setOpen}>
          {legendUi.open ? (
            <div className="animate-in slide-in-from-bottom-2 fade-in-0 duration-200">
              <MetricLegend
                className="w-[18.75rem] max-w-[calc(100vw-2rem)]"
                label={activeLegendMetric.label}
                category={activeLegendCategory}
                paletteId={activeLegendMetric.paletteId}
                format={activeLegendMetric.format}
                colorDomainMin={activeLegendMetric.colorDomainMin}
                colorDomainMax={activeLegendMetric.colorDomainMax}
                headerAction={
                  <CollapsibleTrigger asChild>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-xs"
                      className="text-muted-foreground hover:text-foreground"
                      aria-label="Hide color scale"
                    >
                      <ChevronDownIcon className="size-3.5" />
                    </Button>
                  </CollapsibleTrigger>
                }
              />
            </div>
          ) : (
            <CollapsibleTrigger asChild>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="animate-in slide-in-from-bottom-2 fade-in-0 h-9 rounded-full border-border/90 bg-background/88 px-3 shadow-sm backdrop-blur-sm duration-200"
                aria-label="Show color scale"
              >
                <span
                  className="h-2 w-12 rounded-full border border-border/80"
                  style={{
                    backgroundImage: `linear-gradient(90deg, ${lowColor} 0%, ${midColor} 50%, ${highColor} 100%)`,
                  }}
                />
                <span className="text-xs font-medium">Color Scale</span>
                <ChevronUpIcon className="size-3.5 text-muted-foreground" />
              </Button>
            </CollapsibleTrigger>
          )}
        </Collapsible>
      </div>
    </div>
  );
}
