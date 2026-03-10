import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DA_METRICS, isDaMetricId } from "../config/daMetrics";
import { useMapState } from "../state/useMapState";

export default function LayerSelect() {
  const { state, dispatch } = useMapState();

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
          {DA_METRICS.map((metric) => (
            <SelectItem key={metric.id} value={metric.id}>
              {metric.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
