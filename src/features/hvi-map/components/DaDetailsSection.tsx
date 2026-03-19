import type { ReactNode } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import type { DaFeatureProperties } from "../types/data";
import { getDaDetailsGroups } from "./daDetailsGroups";

interface DaDetailsSectionProps {
  da: DaFeatureProperties;
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
      <CardHeader className="flex flex-row items-center justify-between gap-3 px-4 py-3">
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
}: DaDetailsSectionProps) {
  const summaryGroup = getDaDetailsGroups(da).find(
    (group) => group.title === "HVI Summary"
  );

  if (!summaryGroup) {
    return null;
  }

  return (
    <div className="grid gap-3">
      <Section title={summaryGroup.title}>
        {summaryGroup.rows.map((row) => (
          <ValueRow key={row.label} label={row.label} value={row.value} />
        ))}
      </Section>
    </div>
  );
}
