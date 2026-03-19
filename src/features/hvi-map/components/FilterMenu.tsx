import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { DA_METRICS } from "../config/daMetrics";
import { useMapState } from "../state/useMapState";
import { parseNumericInput } from "../utils/format";

export default function FilterMenu() {
  const { state, dispatch } = useMapState();

  return (
    <div className="grid gap-3 rounded-xl border bg-muted/30 p-3">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">
            Filters
          </p>
          <p className="text-sm font-medium">Filter DA ranges</p>
        </div>
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
          {state.isFilterMenuOpen ? "Hide" : "Show"}
        </Button>
      </div>

      {state.isFilterMenuOpen ? (
        <>
          <Alert className="border-border bg-background/80">
            <AlertDescription>
              Enabled filters combine with AND logic. DA fill is hidden when any
              enabled range is not matched.
            </AlertDescription>
          </Alert>

          <ScrollArea className="max-h-72 rounded-lg border bg-background/90 p-3">
            <div className="grid gap-4">
              {DA_METRICS.map((metric, index) => {
                const range = state.filters[metric.id];

                return (
                  <div key={metric.id} className="grid gap-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="grid gap-1">
                        <Label className="text-sm font-semibold">{metric.label}</Label>
                        <p className="text-xs text-muted-foreground">
                          {metric.category}
                        </p>
                      </div>
                      <Label className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                        <Checkbox
                          checked={range.enabled}
                          onChange={(event) => {
                            dispatch({
                              type: "filterEnabledChanged",
                              metricId: metric.id,
                              enabled: event.currentTarget.checked,
                            });
                          }}
                        />
                        Enable
                      </Label>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div className="grid gap-1.5">
                        <Label
                          htmlFor={`${metric.id}-min`}
                          className="text-[11px] uppercase tracking-[0.14em] text-muted-foreground"
                        >
                          Min
                        </Label>
                        <Input
                          id={`${metric.id}-min`}
                          type="number"
                          step="any"
                          value={range.min ?? ""}
                          placeholder={String(metric.domainMin)}
                          onChange={(event) => {
                            dispatch({
                              type: "filterRangeChanged",
                              metricId: metric.id,
                              min: parseNumericInput(event.target.value),
                              max: range.max,
                            });
                          }}
                        />
                      </div>
                      <div className="grid gap-1.5">
                        <Label
                          htmlFor={`${metric.id}-max`}
                          className="text-[11px] uppercase tracking-[0.14em] text-muted-foreground"
                        >
                          Max
                        </Label>
                        <Input
                          id={`${metric.id}-max`}
                          type="number"
                          step="any"
                          value={range.max ?? ""}
                          placeholder={String(metric.domainMax)}
                          onChange={(event) => {
                            dispatch({
                              type: "filterRangeChanged",
                              metricId: metric.id,
                              min: range.min,
                              max: parseNumericInput(event.target.value),
                            });
                          }}
                        />
                      </div>
                    </div>

                    {index < DA_METRICS.length - 1 ? <Separator /> : null}
                  </div>
                );
              })}
            </div>
          </ScrollArea>

          <div className="flex justify-end">
            <Button
              type="button"
              variant="outline"
              size="xs"
              onClick={() => dispatch({ type: "filtersReset" })}
            >
              Reset Filters
            </Button>
          </div>
        </>
      ) : null}
    </div>
  );
}
