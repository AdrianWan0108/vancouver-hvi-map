import { useMemo, useState } from "react";
import { ChevronRightIcon, XIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Slider } from "@/components/ui/slider";
import {
  DA_FILTER_GROUPS,
  DA_METRICS,
  type DaMetricConfig,
} from "../config/daMetrics";
import {
  formatFilterInputValue,
  getFilterInputStep,
  isFilterRangeActive,
} from "../state/filterRanges";
import { useMapDispatch } from "../state/useMapDispatch";
import { useMapUiState } from "../state/useMapUiState";
import type { DaFilterRange } from "../types/state";
import { parseNumericInput } from "../utils/format";

function FilterRangeField({
  metric,
  range,
  onRangeChange,
}: {
  metric: DaMetricConfig;
  range: DaFilterRange;
  onRangeChange: (nextRange: { min: number; max: number }) => void;
}) {
  const [minDraft, setMinDraft] = useState(() =>
    formatFilterInputValue(range.min, metric.format)
  );
  const [maxDraft, setMaxDraft] = useState(() =>
    formatFilterInputValue(range.max, metric.format)
  );
  const [isEditingMin, setIsEditingMin] = useState(false);
  const [isEditingMax, setIsEditingMax] = useState(false);
  const step = getFilterInputStep(metric.format);
  const rowLabelId = `${metric.id}-label`;

  const minValue = isEditingMin
    ? minDraft
    : formatFilterInputValue(range.min, metric.format);
  const maxValue = isEditingMax
    ? maxDraft
    : formatFilterInputValue(range.max, metric.format);

  function commitMin(raw: string) {
    const parsed = parseNumericInput(raw);
    if (parsed === null) return;
    onRangeChange({ min: parsed, max: range.max });
  }

  function commitMax(raw: string) {
    const parsed = parseNumericInput(raw);
    if (parsed === null) return;
    onRangeChange({ min: range.min, max: parsed });
  }

  return (
    <div
      role="group"
      aria-labelledby={rowLabelId}
      className="grid gap-1.5"
    >
      <div className="flex items-center gap-2">
        <Label
          id={rowLabelId}
          className="truncate text-[12px] leading-4 font-medium"
        >
          {metric.label}
        </Label>
        {isFilterRangeActive(metric.id, range) ? (
          <span className="size-1.5 rounded-full bg-primary/70" aria-hidden="true" />
        ) : null}
      </div>

      <div className="grid grid-cols-[4.5rem_minmax(0,1fr)_4.5rem] items-center gap-2">
        <Input
          aria-label={`${metric.label} minimum`}
          type="number"
          inputMode="decimal"
          min={metric.domainMin}
          max={metric.domainMax}
          step={step}
          className="h-7 px-2 text-[11px]"
          value={minValue}
          onFocus={() => {
            setMinDraft(formatFilterInputValue(range.min, metric.format));
            setIsEditingMin(true);
          }}
          onChange={(event) => {
            const raw = event.target.value;
            setMinDraft(raw);
            commitMin(raw);
          }}
          onBlur={() => {
            setIsEditingMin(false);
            setMinDraft(formatFilterInputValue(range.min, metric.format));
          }}
        />

        <Slider
          min={metric.domainMin}
          max={metric.domainMax}
          step={step}
          value={[range.min, range.max]}
          minStepsBetweenThumbs={0}
          className="mx-0.5"
          onValueChange={(value) => {
            if (value.length < 2) return;
            onRangeChange({ min: value[0], max: value[1] });
          }}
          aria-label={`${metric.label} range`}
        />

        <Input
          aria-label={`${metric.label} maximum`}
          type="number"
          inputMode="decimal"
          min={metric.domainMin}
          max={metric.domainMax}
          step={step}
          className="h-7 px-2 text-[11px]"
          value={maxValue}
          onFocus={() => {
            setMaxDraft(formatFilterInputValue(range.max, metric.format));
            setIsEditingMax(true);
          }}
          onChange={(event) => {
            const raw = event.target.value;
            setMaxDraft(raw);
            commitMax(raw);
          }}
          onBlur={() => {
            setIsEditingMax(false);
            setMaxDraft(formatFilterInputValue(range.max, metric.format));
          }}
        />
      </div>
    </div>
  );
}

export default function FilterMenu() {
  const state = useMapUiState();
  const dispatch = useMapDispatch();

  const groupedMetrics = useMemo(
    () =>
      DA_FILTER_GROUPS.map((group) => ({
        ...group,
        metrics: DA_METRICS.filter((metric) => metric.filterGroup === group.id),
      })).filter((group) => group.metrics.length > 0),
    []
  );

  const activeFilterCount = useMemo(
    () =>
      DA_METRICS.reduce(
        (count, metric) =>
          count + (isFilterRangeActive(metric.id, state.filters[metric.id]) ? 1 : 0),
        0
      ),
    [state.filters]
  );

  return (
    <Popover
      open={state.isFilterMenuOpen}
      onOpenChange={(isOpen) =>
        dispatch({ type: "filterMenuOpenChanged", isOpen })
      }
    >
      <PopoverTrigger asChild>
        <button
          type="button"
          className="flex w-full items-center justify-between rounded-xl border bg-muted/30 px-3 py-3 text-left transition-colors hover:bg-muted/45 focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] focus-visible:outline-none"
          aria-label={
            activeFilterCount > 0
              ? `Filter, ${activeFilterCount} active filters`
              : "Filter"
          }
        >
          <span className="text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">
            Filter
          </span>
          <ChevronRightIcon
            className={`size-4 shrink-0 text-muted-foreground transition-transform duration-200 ${
              state.isFilterMenuOpen ? "rotate-0" : "rotate-180"
            }`}
            aria-hidden="true"
          />
        </button>
      </PopoverTrigger>

      <PopoverContent
        side="right"
        align="start"
        sideOffset={14}
        collisionPadding={16}
        className="w-[34rem] max-w-[calc(100vw-2rem)] rounded-2xl p-0"
      >
        <div className="flex items-center justify-between border-b border-border/80 px-4 py-2.5">
          <Button
            type="button"
            variant="outline"
            size="xs"
            className="border-border/90 bg-background/90 text-foreground shadow-xs hover:bg-accent/70"
            onClick={() => dispatch({ type: "filtersReset" })}
          >
            Reset
          </Button>
          <Button
            type="button"
            variant="default"
            size="xs"
            className="shadow-xs"
            onClick={() =>
              dispatch({ type: "filterMenuOpenChanged", isOpen: false })
            }
          >
            Close
            <XIcon className="size-3" />
          </Button>
        </div>

        <ScrollArea className="max-h-[min(82vh,46rem)]">
          <div className="grid gap-3 p-3.5">
            <p className="text-[11px] leading-4 text-muted-foreground">
              Filters use full metric ranges. Map colors may use clipped display ranges for contrast.
            </p>
            {groupedMetrics.map((group, groupIndex) => (
              <section key={group.id} className="grid gap-2">
                <div className="flex items-center gap-2">
                  <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">
                    {group.label}
                  </p>
                  <Separator className="flex-1" />
                </div>

                <div
                  className={
                    group.id === "hvi" || group.id === "population"
                      ? "grid gap-x-4 gap-y-2"
                      : "grid gap-x-4 gap-y-2 sm:grid-cols-2"
                  }
                >
                  {group.metrics.map((metric) => (
                    <FilterRangeField
                      key={metric.id}
                      metric={metric}
                      range={state.filters[metric.id]}
                      onRangeChange={(nextRange) =>
                        dispatch({
                          type: "filterRangeChanged",
                          metricId: metric.id,
                          min: nextRange.min,
                          max: nextRange.max,
                        })
                      }
                    />
                  ))}
                </div>

                {groupIndex < groupedMetrics.length - 1 ? (
                  <Separator className="mt-0.5" />
                ) : null}
              </section>
            ))}
          </div>
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}
