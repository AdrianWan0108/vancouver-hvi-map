import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  HVI_METHOD_FINAL_FORMULA,
  HVI_METHOD_INTERPRETATION,
  HVI_METHODOLOGY_NOTE,
  HVI_METHODOLOGY_SECTIONS,
} from "./hviMethodology";

export default function HviMethodologySheet() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button type="button" variant="outline" size="xs" className="w-full">
          How HVI is built
        </Button>
      </SheetTrigger>

      <SheetContent side="right" className="w-[min(32rem,100vw)] sm:max-w-lg">
        <SheetHeader className="border-b border-border/80">
          <SheetTitle>How HVI is built</SheetTitle>
          <SheetDescription>
            A compact summary of the project methodology and the major variables
            that feed the final heat vulnerability index.
          </SheetDescription>
        </SheetHeader>

        <div className="grid gap-4 overflow-auto px-4 pb-5">
          <section className="grid gap-3 rounded-xl border border-border/80 bg-muted/30 p-4">
            <div className="grid gap-1">
              <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">
                Final Formula
              </p>
              <p className="rounded-lg border border-border/80 bg-background px-3 py-2 font-mono text-sm font-medium">
                {HVI_METHOD_FINAL_FORMULA}
              </p>
            </div>
            <p className="text-sm leading-6 text-muted-foreground">
              {HVI_METHOD_INTERPRETATION}
            </p>
          </section>

          {HVI_METHODOLOGY_SECTIONS.map((section) => (
            <section
              key={section.title}
              className="grid gap-3 rounded-xl border border-border/80 bg-background/90 p-4"
            >
              <div className="grid gap-1">
                <h3 className="text-sm font-semibold">{section.title}</h3>
                <p className="rounded-lg border border-border/80 bg-muted/30 px-3 py-2 font-mono text-sm">
                  {section.formula}
                </p>
              </div>
              <p className="text-sm leading-6 text-muted-foreground">
                {section.summary}
              </p>
              <div className="grid gap-1.5">
                {section.indicators.map((indicator) => (
                  <p
                    key={indicator}
                    className="text-sm leading-6 text-muted-foreground"
                  >
                    {indicator}
                  </p>
                ))}
              </div>
            </section>
          ))}

          <p className="rounded-lg border border-dashed border-border/80 bg-muted/20 px-3 py-2 text-xs leading-5 text-muted-foreground">
            {HVI_METHODOLOGY_NOTE}
          </p>
        </div>
      </SheetContent>
    </Sheet>
  );
}
