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
import { useMapState } from "../state/useMapState";

export default function LayerSelect() {
  const { state, dispatch } = useMapState();
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
        <SelectContent>
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
