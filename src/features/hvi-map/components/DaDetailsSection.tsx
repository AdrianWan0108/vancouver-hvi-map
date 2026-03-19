import { useState, type ReactNode } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { DA_METRICS_BY_ID, type DaMetricId } from "../config/daMetrics";
import type { DaFeatureProperties } from "../types/data";
import {
  getDaDetailsGroups,
  getDefaultDaDetailsExpandedState,
} from "./daDetailsGroups";
import { formatMetricValue } from "../utils/format";

interface DaDetailsSectionProps {
  da: DaFeatureProperties;
  selectedMetric: DaMetricId;
}

function Section({
  title,
  children,
  collapsible = false,
  isExpanded = true,
  onToggle,
}: {
  title: string;
  children: ReactNode;
  collapsible?: boolean;
  isExpanded?: boolean;
  onToggle?: () => void;
}) {
  return (
    <Card className="gap-0 overflow-hidden border-border/80 bg-background/90 shadow-none">
      <CardHeader className="flex flex-row items-center justify-between gap-3 px-4 py-3">
        <CardTitle className="text-sm">{title}</CardTitle>
        {collapsible ? (
          <Button type="button" variant="outline" size="xs" onClick={onToggle}>
            {isExpanded ? "Hide" : "Show"}
          </Button>
        ) : null}
      </CardHeader>
      {isExpanded ? (
        <>
          <Separator />
          <CardContent className="grid gap-2 px-4 py-3 text-sm">
            {children}
          </CardContent>
        </>
      ) : null}
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
  const detailGroups = getDaDetailsGroups(da);
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>(
    () => getDefaultDaDetailsExpandedState()
  );

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

      {detailGroups.map((group) => (
        <Section
          key={group.title}
          title={group.title}
          collapsible={group.collapsible}
          isExpanded={expandedGroups[group.title] ?? group.defaultExpanded}
          onToggle={() =>
            setExpandedGroups((current) => ({
              ...current,
              [group.title]: !(current[group.title] ?? group.defaultExpanded),
            }))
          }
        >
          {group.rows.map((row) => (
            <ValueRow key={row.label} label={row.label} value={row.value} />
          ))}
        </Section>
      ))}
    </div>
  );
}
