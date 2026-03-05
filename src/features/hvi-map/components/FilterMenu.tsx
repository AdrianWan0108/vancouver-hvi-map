import { Button } from "@/components/ui/button";
import { DA_METRICS } from "../config/daMetrics";
import { useMapState } from "../state/useMapState";
import { parseNumericInput } from "../utils/format";

export default function FilterMenu() {
  const { state, dispatch } = useMapState();

  return (
    <div style={{ display: "grid", gap: 8 }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
        <div style={{ fontWeight: 600, fontSize: 12 }}>Filter Menu</div>
        <Button
          type="button"
          variant="outline"
          size="xs"
          onClick={() =>
            dispatch({
              type: "filterMenuOpenChanged",
              isOpen: !state.isFilterMenuOpen,
            })
          }
        >
          {state.isFilterMenuOpen ? "Hide Filters" : "Show Filters"}
        </Button>
      </div>

      {state.isFilterMenuOpen ? (
        <div
          style={{
            border: "1px solid rgba(0,0,0,0.12)",
            borderRadius: 8,
            padding: 8,
            display: "grid",
            gap: 10,
            maxHeight: 240,
            overflow: "auto",
          }}
        >
          {DA_METRICS.map((metric) => {
            const range = state.filters[metric.id];
            return (
              <div
                key={metric.id}
                style={{
                  display: "grid",
                  gap: 6,
                  borderBottom: "1px solid rgba(0,0,0,0.06)",
                  paddingBottom: 8,
                }}
              >
                <div
                  style={{ display: "flex", justifyContent: "space-between", gap: 8 }}
                >
                  <label style={{ fontSize: 12, fontWeight: 600 }}>{metric.label}</label>
                  <label style={{ fontSize: 12, display: "flex", alignItems: "center", gap: 4 }}>
                    <input
                      type="checkbox"
                      checked={range.enabled}
                      onChange={(event) => {
                        dispatch({
                          type: "filterEnabledChanged",
                          metricId: metric.id,
                          enabled: event.target.checked,
                        });
                      }}
                    />
                    Enable
                  </label>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
                  <input
                    type="number"
                    step="any"
                    value={range.min ?? ""}
                    placeholder={
                      metric.defaultMin !== null ? String(metric.defaultMin) : "Min"
                    }
                    onChange={(event) => {
                      dispatch({
                        type: "filterRangeChanged",
                        metricId: metric.id,
                        min: parseNumericInput(event.target.value),
                        max: range.max,
                      });
                    }}
                    style={{
                      width: "100%",
                      border: "1px solid rgba(0,0,0,0.18)",
                      borderRadius: 6,
                      padding: "4px 6px",
                      fontSize: 12,
                    }}
                  />
                  <input
                    type="number"
                    step="any"
                    value={range.max ?? ""}
                    placeholder={
                      metric.defaultMax !== null ? String(metric.defaultMax) : "Max"
                    }
                    onChange={(event) => {
                      dispatch({
                        type: "filterRangeChanged",
                        metricId: metric.id,
                        min: range.min,
                        max: parseNumericInput(event.target.value),
                      });
                    }}
                    style={{
                      width: "100%",
                      border: "1px solid rgba(0,0,0,0.18)",
                      borderRadius: 6,
                      padding: "4px 6px",
                      fontSize: 12,
                    }}
                  />
                </div>
              </div>
            );
          })}

          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            <Button
              type="button"
              variant="outline"
              size="xs"
              onClick={() => dispatch({ type: "filtersReset" })}
            >
              Reset Filters
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
