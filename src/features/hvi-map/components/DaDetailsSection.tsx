import type { ReactNode } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { DA_METRICS_BY_ID, type DaMetricId } from "../config/daMetrics";
import type { DaFeatureProperties } from "../types/data";
import {
  formatInteger,
  formatMetricValue,
  formatPercent1,
  formatScore,
} from "../utils/format";

interface DaDetailsSectionProps {
  da: DaFeatureProperties;
  selectedMetric: DaMetricId;
}

function Section({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <Card className="gap-0 overflow-hidden border-border/80 bg-background/90 shadow-none">
      <CardHeader className="px-4 py-3">
        <CardTitle className="text-sm">{title}</CardTitle>
      </CardHeader>
      <Separator />
      <CardContent className="grid gap-2 px-4 py-3 text-sm">
        {children}
      </CardContent>
    </Card>
  );
}

function ValueRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3">
      <span className="text-muted-foreground">{label}</span>
      <span className="text-right font-medium text-card-foreground">{value}</span>
    </div>
  );
}

export default function DaDetailsSection({
  da,
  selectedMetric,
}: DaDetailsSectionProps) {
  const primaryMetric = DA_METRICS_BY_ID[selectedMetric];

  return (
    <div className="grid gap-3">
      <Section title="Selected Layer">
        <div className="flex items-center justify-between gap-3">
          <Badge variant="secondary">{primaryMetric.category}</Badge>
          <span className="text-xs uppercase tracking-[0.14em] text-muted-foreground">
            DA {da.DGUID}
          </span>
        </div>
        <Separator className="my-1" />
        <ValueRow
          label={primaryMetric.label}
          value={formatMetricValue(primaryMetric, da[primaryMetric.propertyKey])}
        />
      </Section>

      <Section title="HVI">
        <ValueRow label="HVI (0-1)" value={formatScore(da.hvi_index_n01)} />
        <ValueRow label="Sensitivity" value={formatScore(da.sensitivity_index)} />
        <ValueRow
          label="Adaptive Capacity"
          value={formatScore(da.adaptive_capacity_index)}
        />
        <ValueRow label="Exposure Index" value={formatScore(da.exposure_index)} />
      </Section>

      <Section title="Key Stats">
        <ValueRow label="Population" value={formatInteger(da.pop_total)} />
        <ValueRow
          label="Unemployment Rate"
          value={formatPercent1(da.unemployment_rate)}
        />
        <ValueRow
          label="Low Income Rate"
          value={formatPercent1(da.low_income_rate)}
        />
        <ValueRow
          label="% Seniors 65+"
          value={formatPercent1(da.pct_seniors_65plus)}
        />
        <ValueRow
          label="% Living Alone"
          value={formatPercent1(da.pct_living_alone)}
        />
      </Section>

      <Section title="Greenness">
        <ValueRow label="Green Fraction" value={formatScore(da.green_frac)} />
        <ValueRow label="Coniferous" value={formatScore(da.frac_coniferous)} />
        <ValueRow label="Deciduous" value={formatScore(da.frac_deciduous)} />
        <ValueRow label="Shrub" value={formatScore(da.frac_shrub)} />
        <ValueRow
          label="Modified Herb"
          value={formatScore(da.frac_modified_herb)}
        />
        <ValueRow
          label="Natural Herb"
          value={formatScore(da.frac_natural_herb)}
        />
      </Section>
    </div>
  );
}
