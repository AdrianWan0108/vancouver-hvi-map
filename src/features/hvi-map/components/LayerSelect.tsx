import { Fragment } from "react";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { isDaMetricId } from "../config/daMetrics";
import { getLayerMetricGroups } from "./layerOptions";
import { useMapDispatch } from "../state/useMapDispatch";
import { useMapUiState } from "../state/useMapUiState";

export default function LayerSelect() {
  const state = useMapUiState();
  const dispatch = useMapDispatch();
  const layerGroups = getLayerMetricGroups();

  return (
    <div className="grid gap-2">
      <Label className="text-xs uppercase tracking-[0.14em] text-muted-foreground">
        Layer
      </Label>
      <Select
        value={state.selectedMetric}
        onValueChange={(value) => {
          if (!isDaMetricId(value)) return;
          dispatch({ type: "selectedMetricChanged", metricId: value });
        }}
        >
        <SelectTrigger size="sm" className="w-full bg-background">
          <SelectValue placeholder="Select a layer" />
        </SelectTrigger>
        <SelectContent
          position="popper"
          align="start"
          className="w-[min(24rem,var(--radix-select-trigger-width))] max-w-[24rem]"
          viewportClassName="max-h-[min(32rem,70vh)]"
        >
          {layerGroups.map((group, index) => (
            <Fragment key={group.label}>
              {index > 0 ? <SelectSeparator /> : null}
              <SelectGroup>
                <SelectLabel>{group.label}</SelectLabel>
                {group.metrics.map((metric) => (
                  <SelectItem key={metric.id} value={metric.id}>
                    {metric.label}
                  </SelectItem>
                ))}
              </SelectGroup>
            </Fragment>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
