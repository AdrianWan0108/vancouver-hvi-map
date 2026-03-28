import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
  type RefObject,
} from "react";
import { ChevronRightIcon, CircleHelpIcon, XIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { getPaletteConfig } from "../config/palettes";
import type { DaFeatureProperties } from "../types/data";
import { resolvePanelDensity, type PanelDensity } from "./daDetailsDensity";
import {
  DA_COMPONENT_DISPLAY_SCALING_NOTE,
  getDaComponentDetailCards,
  getDaHviSummaryDetail,
  type DaComponentDetailCard,
  type DaComponentId,
} from "./daComponentDetails";
import {
  COMPACT_CARD_BAR_ANIMATION_DURATION_MS,
  DETAIL_ROW_ANIMATION_STAGGER_MS,
  formatAnimatedMetricValue,
  getDetailRowAnimationProgress,
  interpolateAnimatedValue,
} from "./daDetailAnimation";

interface DaDetailsSectionProps {
  da: DaFeatureProperties;
}

const PANEL_DENSITY_STYLES = {
  comfortable: {
    outerGap: "gap-3",
    cardsGap: "gap-3",
    cardItemGap: "gap-2",
    sectionHeader: "px-4 py-1.5",
    sectionContent: "gap-1.5 px-4 py-1.5",
    summaryStack: "gap-1.5",
    summaryRow: "gap-2",
    summaryValue: "text-xl",
    summaryText: "text-[11px] leading-4",
    cardHeader: "px-4 py-2",
    cardHeaderGap: "gap-3",
    chevron: "size-3.5",
    scoreValue: "text-base",
    cardContent: "gap-1.5 px-4 py-2",
    scaleRow: "text-[10px]",
  },
  compact: {
    outerGap: "gap-3",
    cardsGap: "gap-3",
    cardItemGap: "gap-1.5",
    sectionHeader: "px-4 py-1.5",
    sectionContent: "gap-1.5 px-4 py-1.5",
    summaryStack: "gap-1.5",
    summaryRow: "gap-1.5",
    summaryValue: "text-xl",
    summaryText: "text-[11px] leading-4",
    cardHeader: "px-4 py-2",
    cardHeaderGap: "gap-2.5",
    chevron: "size-3.5",
    scoreValue: "text-base",
    cardContent: "gap-1.5 px-4 py-1.5",
    scaleRow: "text-[10px]",
  },
  ultra: {
    outerGap: "gap-2.5",
    cardsGap: "gap-2.5",
    cardItemGap: "gap-1.5",
    sectionHeader: "px-4 py-1",
    sectionContent: "gap-1 px-4 py-1",
    summaryStack: "gap-1",
    summaryRow: "gap-1",
    summaryValue: "text-lg",
    summaryText: "text-[11px] leading-4",
    cardHeader: "px-4 py-1.5",
    cardHeaderGap: "gap-2",
    chevron: "size-3",
    scoreValue: "text-[15px]",
    cardContent: "gap-1 px-4 py-1.5",
    scaleRow: "text-[10px]",
  },
} satisfies Record<
  PanelDensity,
  {
    outerGap: string;
    cardsGap: string;
    cardItemGap: string;
    sectionHeader: string;
    sectionContent: string;
    summaryStack: string;
    summaryRow: string;
    summaryValue: string;
    summaryText: string;
    cardHeader: string;
    cardHeaderGap: string;
    chevron: string;
    scoreValue: string;
    cardContent: string;
    scaleRow: string;
  }
>;

function useIsDesktop() {
  const [isDesktop, setIsDesktop] = useState(() =>
    typeof window !== "undefined" && typeof window.matchMedia === "function"
      ? window.matchMedia("(min-width: 768px)").matches
      : false
  );

  useEffect(() => {
    if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
      return undefined;
    }

    const media = window.matchMedia("(min-width: 768px)");
    const onChange = (event: MediaQueryListEvent) => {
      setIsDesktop(event.matches);
    };

    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  }, []);

  return isDesktop;
}

function usePanelDensity({
  isDesktop,
  rootRef,
  watchValue,
}: {
  isDesktop: boolean;
  rootRef: RefObject<HTMLDivElement | null>;
  watchValue: string;
}) {
  const [viewportHeight, setViewportHeight] = useState(() =>
    typeof window === "undefined" ? 900 : window.innerHeight
  );
  const [isOverflowing, setIsOverflowing] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") {
      return undefined;
    }

    const onResize = () => setViewportHeight(window.innerHeight);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") {
      return undefined;
    }

    const rootElement = rootRef.current;
    if (!rootElement) {
      return undefined;
    }

    const scrollContainer = rootElement.closest('[data-hvi-panel-scroll="true"]');
    if (!(scrollContainer instanceof HTMLElement)) {
      const resetRafId = window.requestAnimationFrame(() => {
        setIsOverflowing(false);
      });
      return () => window.cancelAnimationFrame(resetRafId);
    }

    const measureOverflow = () => {
      setIsOverflowing(scrollContainer.scrollHeight > scrollContainer.clientHeight + 1);
    };

    measureOverflow();
    const rafId = window.requestAnimationFrame(measureOverflow);

    let resizeObserver: ResizeObserver | undefined;
    if (typeof ResizeObserver !== "undefined") {
      resizeObserver = new ResizeObserver(measureOverflow);
      resizeObserver.observe(scrollContainer);
      resizeObserver.observe(rootElement);
    }

    window.addEventListener("resize", measureOverflow);

    return () => {
      window.cancelAnimationFrame(rafId);
      window.removeEventListener("resize", measureOverflow);
      resizeObserver?.disconnect();
    };
  }, [rootRef, watchValue]);

  return useMemo(
    () =>
      resolvePanelDensity({
        isDesktop,
        viewportHeight,
        isOverflowing,
      }),
    [isDesktop, viewportHeight, isOverflowing]
  );
}

function Section({
  title,
  density,
  headerAction,
  children,
}: {
  title: string;
  density: PanelDensity;
  headerAction?: ReactNode;
  children: ReactNode;
}) {
  const styles = PANEL_DENSITY_STYLES[density];

  return (
    <Card className="gap-0 overflow-hidden border-border/80 bg-background/90 py-0 shadow-none">
      <CardHeader
        className={cn(
          "flex flex-row items-center justify-between gap-2",
          styles.sectionHeader
        )}
      >
        <CardTitle className="text-sm">{title}</CardTitle>
        {headerAction ? <div className="shrink-0">{headerAction}</div> : null}
      </CardHeader>
      <Separator />
      <CardContent className={cn("grid text-sm", styles.sectionContent)}>
        {children}
      </CardContent>
    </Card>
  );
}

function IndicatorBarRow({
  label,
  value,
  numericValue,
  format,
  barPercent,
  paletteId,
  animationKey,
  rowIndex,
}: {
  label: string;
  value: string;
  numericValue: number | null;
  format: DaComponentDetailCard["sections"][number]["rows"][number]["format"];
  barPercent: number;
  paletteId: DaComponentDetailCard["sections"][number]["rows"][number]["paletteId"];
  animationKey: number;
  rowIndex: number;
}) {
  const palette = getPaletteConfig(paletteId);
  const prefersReducedMotion = usePrefersReducedMotion();
  const [animatedProgress, setAnimatedProgress] = useState(() =>
    prefersReducedMotion ? 1 : 0
  );

  useEffect(() => {
    if (prefersReducedMotion) {
      return undefined;
    }

    let frameId = 0;
    const startTime = performance.now();
    const delayMs = rowIndex * DETAIL_ROW_ANIMATION_STAGGER_MS;

    const tick = (now: number) => {
      const nextProgress = getDetailRowAnimationProgress({
        elapsedMs: now - startTime,
        delayMs,
      });
      setAnimatedProgress((current) =>
        Math.abs(current - nextProgress) < 0.001 ? current : nextProgress
      );

      if (nextProgress < 1) {
        frameId = window.requestAnimationFrame(tick);
      }
    };

    frameId = window.requestAnimationFrame(tick);

    return () => {
      window.cancelAnimationFrame(frameId);
    };
  }, [animationKey, prefersReducedMotion, rowIndex]);

  const progress = prefersReducedMotion ? 1 : animatedProgress;
  const animatedValue = formatAnimatedMetricValue({
    format,
    numericValue,
    progress,
    fallbackValue: value,
  });

  return (
    <div className="grid gap-1">
      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-2 text-sm">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-medium text-card-foreground">{animatedValue}</span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-muted">
        <div
          className="h-full rounded-full"
          style={{
            width: `${barPercent * progress * 100}%`,
            backgroundColor: palette.stops[1],
          }}
        />
      </div>
    </div>
  );
}

function usePrefersReducedMotion() {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(() =>
    typeof window !== "undefined" && typeof window.matchMedia === "function"
      ? window.matchMedia("(prefers-reduced-motion: reduce)").matches
      : false
  );

  useEffect(() => {
    if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
      return undefined;
    }

    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const handleChange = (event: MediaQueryListEvent) => {
      setPrefersReducedMotion(event.matches);
    };

    media.addEventListener("change", handleChange);
    return () => media.removeEventListener("change", handleChange);
  }, []);

  return prefersReducedMotion;
}

function useAnimatedCompactScore(score: number) {
  const prefersReducedMotion = usePrefersReducedMotion();
  const [animatedScore, setAnimatedScore] = useState(score);
  const animatedScoreRef = useRef(score);
  const targetScoreRef = useRef(score);

  useEffect(() => {
    animatedScoreRef.current = animatedScore;
  }, [animatedScore]);

  useEffect(() => {
    if (prefersReducedMotion) {
      let syncFrameId = 0;
      syncFrameId = window.requestAnimationFrame(() => {
        animatedScoreRef.current = score;
        targetScoreRef.current = score;
        setAnimatedScore(score);
      });
      return () => {
        window.cancelAnimationFrame(syncFrameId);
      };
    }

    if (Math.abs(targetScoreRef.current - score) < 0.0005) {
      return undefined;
    }

    const startScore = animatedScoreRef.current;
    const endScore = score;
    targetScoreRef.current = endScore;
    let frameId = 0;
    const startTime = performance.now();

    const tick = (now: number) => {
      const progress = getDetailRowAnimationProgress({
        elapsedMs: now - startTime,
        delayMs: 0,
        durationMs: COMPACT_CARD_BAR_ANIMATION_DURATION_MS,
      });
      const nextScore = interpolateAnimatedValue({
        start: startScore,
        end: endScore,
        progress,
      });
      animatedScoreRef.current = nextScore;
      setAnimatedScore(nextScore);

      if (progress < 1) {
        frameId = window.requestAnimationFrame(tick);
      }
    };

    frameId = window.requestAnimationFrame(tick);

    return () => {
      window.cancelAnimationFrame(frameId);
    };
  }, [prefersReducedMotion, score]);

  return prefersReducedMotion ? score : animatedScore;
}

function ComponentCardButton({
  component,
  density,
  isOpen,
  onToggle,
}: {
  component: DaComponentDetailCard;
  density: PanelDensity;
  isOpen: boolean;
  onToggle: () => void;
}) {
  const styles = PANEL_DENSITY_STYLES[density];
  const palette = getPaletteConfig(component.compactPreviewPaletteId);
  const animatedScore = useAnimatedCompactScore(component.scoreNumericValue);

  return (
    <button
      type="button"
      className="w-full text-left"
      aria-expanded={isOpen}
      onClick={onToggle}
    >
      <Card className="gap-0 overflow-hidden border-border/80 bg-background/90 py-0 shadow-none transition-colors hover:border-border hover:bg-background">
        <CardHeader className={cn("flex items-center", styles.cardHeader)}>
          <div
            className={cn(
              "flex min-h-5 w-full items-center justify-between",
              styles.cardHeaderGap
            )}
          >
            <div className="flex items-center gap-1.5">
              <CardTitle className="text-sm leading-none">{component.title}</CardTitle>
              <ChevronRightIcon
                className={cn(
                  "text-muted-foreground transition-transform",
                  styles.chevron,
                  isOpen ? "" : "rotate-180"
                )}
              />
            </div>
            <div className="self-center text-right">
              <p
                className={cn(
                  "font-semibold leading-none text-card-foreground",
                  styles.scoreValue
                )}
              >
                {component.scoreValue}
              </p>
            </div>
          </div>
        </CardHeader>
        <Separator />
        <CardContent className={cn("grid", styles.cardContent)}>
          <div
            role="progressbar"
            aria-label={`${component.title} normalized value`}
            aria-valuemin={0}
            aria-valuemax={1}
            aria-valuenow={Number(animatedScore.toFixed(3))}
            className="h-2.5 overflow-hidden rounded-full border border-border/70 bg-muted/50"
          >
            <div
              className="h-full rounded-full"
              style={{
                width: `${animatedScore * 100}%`,
                backgroundColor: palette.stops[1],
              }}
            />
          </div>
          <div
            className={cn(
              "grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-2 text-muted-foreground",
              styles.scaleRow
            )}
          >
            <span>0</span>
            <span className="text-center">Normalized value</span>
            <span className="text-right">1</span>
          </div>
        </CardContent>
      </Card>
    </button>
  );
}

function ComponentDetailPanel({
  component,
  animationKey,
  onClose,
}: {
  component: DaComponentDetailCard;
  animationKey: number;
  onClose?: () => void;
}) {
  return (
    <Card className="gap-0 overflow-hidden border-border/80 bg-background/95 shadow-xl backdrop-blur-sm">
      <CardHeader className="px-4 py-4">
        <div className="flex items-start justify-between gap-4">
          <div className="grid gap-1.5">
            <div className="flex items-center gap-2">
              <CardTitle className="text-base">{component.title}</CardTitle>
              <Badge variant="secondary">{component.scoreValue}</Badge>
            </div>
          </div>
          {onClose ? (
            <Button type="button" variant="ghost" size="icon-xs" onClick={onClose}>
              <XIcon className="size-3.5" />
              <span className="sr-only">Close component details</span>
            </Button>
          ) : null}
        </div>
      </CardHeader>
      <Separator />
      <CardContent className="grid max-h-[calc(100vh-12rem)] gap-4 overflow-auto px-4 py-4">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                type="button"
                variant="outline"
                size="xs"
                className="w-fit rounded-full border-border/80 px-2.5 text-muted-foreground"
                aria-label="About these bars"
              >
                <CircleHelpIcon className="size-3.5" />
                <span>About these bars</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent side="top" align="start" className="max-w-72">
              <p className="text-xs leading-4">{DA_COMPONENT_DISPLAY_SCALING_NOTE}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        {component.sections.map((section, index) => {
          const rowStartIndex = component.sections
            .slice(0, index)
            .reduce((count, currentSection) => count + currentSection.rows.length, 0);

          return (
          <div key={section.title} className="grid gap-3">
            {index > 0 ? <Separator /> : null}
            <div className="grid gap-3">
              <p className="text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
                {section.title}
              </p>
              {section.rows.map((row, rowIndex) => (
                  <IndicatorBarRow
                    key={`${animationKey}:${row.metricId}`}
                    label={row.label}
                    value={row.value}
                    numericValue={row.numericValue}
                    format={row.format}
                    barPercent={row.barPercent}
                    paletteId={row.paletteId}
                    animationKey={animationKey}
                    rowIndex={rowStartIndex + rowIndex}
                  />
              ))}
            </div>
          </div>
        )})}
      </CardContent>
    </Card>
  );
}

export default function DaDetailsSection({ da }: DaDetailsSectionProps) {
  const [openComponent, setOpenComponent] = useState<DaComponentId | null>(null);
  const [detailAnimationKey, setDetailAnimationKey] = useState(0);
  const isDesktop = useIsDesktop();
  const rootRef = useRef<HTMLDivElement>(null);
  const summary = useMemo(() => getDaHviSummaryDetail(da), [da]);
  const components = useMemo(() => getDaComponentDetailCards(da), [da]);
  const density = usePanelDensity({
    isDesktop,
    rootRef,
    watchValue: `${openComponent ?? "none"}-${components.length}`,
  });
  const styles = PANEL_DENSITY_STYLES[density];
  const activeComponent =
    openComponent === null
      ? null
      : components.find((component) => component.id === openComponent) ?? null;

  const toggleComponent = (componentId: DaComponentId) => {
    const nextOpenComponent = openComponent === componentId ? null : componentId;
    if (nextOpenComponent !== null) {
      setDetailAnimationKey((current) => current + 1);
    }
    setOpenComponent(nextOpenComponent);
  };

  if (components.length === 0) {
    return null;
  }

  return (
    <>
      <div
        ref={rootRef}
        data-density={density}
        className={cn("grid", styles.outerGap)}
      >
        <Section
          title="HVI Summary"
          density={density}
          headerAction={
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-xs"
                    className="size-5 rounded-full text-muted-foreground hover:text-foreground"
                    aria-label="Explain HVI summary"
                  >
                    <CircleHelpIcon className="size-3.5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="top" align="end">
                  {summary.note}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          }
        >
          <div className={cn("grid", styles.summaryStack)}>
            <div
              className={cn(
                "grid grid-cols-[minmax(0,1fr)_auto] items-end",
                styles.summaryRow
              )}
            >
              <div>
                <p className="text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
                  HVI (0-1)
                </p>
                <p
                  className={cn(
                    "font-semibold leading-none text-card-foreground",
                    styles.summaryValue
                  )}
                >
                  {summary.scoreValue}
                </p>
              </div>
              <div className="flex flex-nowrap justify-end gap-1">
                <Badge variant="secondary" className="shrink-0 px-2 py-0 text-[10px]">
                  E
                </Badge>
                <Badge variant="secondary" className="shrink-0 px-2 py-0 text-[10px]">
                  S
                </Badge>
                <Badge variant="secondary" className="shrink-0 px-2 py-0 text-[10px]">
                  1 - A
                </Badge>
              </div>
            </div>
            <p className={cn("text-muted-foreground", styles.summaryText)}>
              {summary.formula}
            </p>
          </div>
        </Section>

        <div className={cn("grid", styles.cardsGap)}>
          {components.map((component) => (
            <div key={component.id} className={cn("grid", styles.cardItemGap)}>
              <ComponentCardButton
                component={component}
                density={density}
                isOpen={openComponent === component.id}
                onToggle={() => toggleComponent(component.id)}
              />
              {!isDesktop && openComponent === component.id ? (
                <ComponentDetailPanel
                  component={component}
                  animationKey={detailAnimationKey}
                />
              ) : null}
            </div>
          ))}
        </div>
      </div>

      {isDesktop && activeComponent ? (
        <div className="fixed top-24 left-[calc(24rem+0.75rem)] z-10 hidden w-[22rem] md:block">
          <ComponentDetailPanel
            component={activeComponent}
            animationKey={detailAnimationKey}
            onClose={() => setOpenComponent(null)}
          />
        </div>
      ) : null}
    </>
  );
}
