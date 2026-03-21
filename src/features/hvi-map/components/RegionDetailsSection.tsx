import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import type { RegionFeatureProperties } from "../types/data";
import { getRegionDisplayName } from "../utils/region";
import { getRegionDetailsRows } from "./regionDetails";

interface RegionDetailsSectionProps {
  region: RegionFeatureProperties;
}

function ValueRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3">
      <span className="text-muted-foreground">{label}</span>
      <span className="text-right font-medium text-card-foreground">{value}</span>
    </div>
  );
}

export default function RegionDetailsSection({
  region,
}: RegionDetailsSectionProps) {
  const regionName = getRegionDisplayName(region) ?? "Unnamed Region";
  const rows = getRegionDetailsRows(region);

  return (
    <Card className="gap-0 overflow-hidden border-border/80 bg-background/90 shadow-none">
      <CardHeader className="grid gap-2 px-4 py-3">
        <div className="flex items-center justify-between gap-3">
          <Badge variant="secondary">Region Summary</Badge>
          {typeof region.MunNum === "number" ? (
            <span className="text-xs uppercase tracking-[0.14em] text-muted-foreground">
              Region {region.MunNum}
            </span>
          ) : null}
        </div>
        <CardTitle className="text-sm">{regionName}</CardTitle>
      </CardHeader>
      <Separator />
      <CardContent className="grid gap-2 px-4 py-3 text-sm">
        {rows.map((row) => (
          <ValueRow key={row.label} label={row.label} value={row.value} />
        ))}
      </CardContent>
    </Card>
  );
}
