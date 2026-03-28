import { Card, CardContent } from "@/components/ui/card";
import type { SelectedPlaceContent } from "./panelContent";

interface SelectedPlaceCardProps {
  content: SelectedPlaceContent;
}

export default function SelectedPlaceCard({
  content,
}: SelectedPlaceCardProps) {
  return (
    <Card className="gap-0 overflow-hidden border-border/80 bg-background/90 py-0 shadow-none">
      <CardContent className="grid gap-1.5 px-4 py-3">
        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
          {content.eyebrow}
        </p>
        <h2 className="text-sm font-semibold text-card-foreground">
          {content.title}
        </h2>
        {content.subtitle ? (
          <p className="text-sm text-muted-foreground">{content.subtitle}</p>
        ) : null}
        {content.meta ? (
          <p className="text-xs text-muted-foreground/90">{content.meta}</p>
        ) : null}
      </CardContent>
    </Card>
  );
}
