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
    <div style={{ display: "grid", gap: 6 }}>
      <label style={{ fontWeight: 600, fontSize: 12 }}>Layer</label>
      <Select
        value={state.selectedMetric}
        onValueChange={(value) => {
          if (!isDaMetricId(value)) return;
          dispatch({ type: "selectedMetricChanged", metricId: value });
        }}
      >
        <SelectTrigger size="sm" style={{ width: "100%" }}>
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
