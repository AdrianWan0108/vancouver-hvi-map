import type { ZoomMode } from "../types/data";
import { getInfoGuideContent } from "./infoModeContent";

interface InfoModeSectionProps {
  zoomMode: ZoomMode;
}

export default function InfoModeSection({ zoomMode }: InfoModeSectionProps) {
  const content = getInfoGuideContent(zoomMode);

  return (
    <section className="flex flex-1 items-start rounded-xl border border-border/80 bg-background/65 p-4 shadow-xs">
      <div className="w-full space-y-4">
        <div className="space-y-1.5">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            {content.heading}
          </p>
          <p className="text-sm leading-6 text-muted-foreground">
            {content.intro}
          </p>
        </div>

        <ol className="grid gap-4">
          {content.steps.map((step, index) => (
            <li key={step.title} className="flex items-start gap-3">
              <div className="flex size-5 shrink-0 items-center justify-center rounded-full bg-accent/80 text-[11px] font-semibold text-foreground">
                {index + 1}
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium leading-5">{step.title}</p>
                <p className="text-xs leading-5 text-muted-foreground/80">
                  {step.description}
                </p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
