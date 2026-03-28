import { useCallback, useEffect, useState } from "react";
import { XIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useMapUiState } from "../state/useMapUiState";
import {
  persistGetStartedDismissed,
  readGetStartedDismissed,
  shouldAutoDismissGetStarted,
} from "./getStartedOverlayState";

interface GetStartedOverlayProps {
  searchSelectionCount: number;
}

export default function GetStartedOverlay({
  searchSelectionCount,
}: GetStartedOverlayProps) {
  const state = useMapUiState();
  const [dismissed, setDismissed] = useState(() => readGetStartedDismissed());

  const dismiss = useCallback(() => {
    setDismissed(true);
    persistGetStartedDismissed();
  }, []);

  useEffect(() => {
    if (dismissed) {
      return;
    }

    if (!shouldAutoDismissGetStarted({
      zoomMode: state.zoomMode,
      hasLockedRegion: state.lockedRegion !== null,
      hasLockedDa: state.lockedDa !== null,
      searchSelectionCount,
    })) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      dismiss();
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [
    dismiss,
    dismissed,
    searchSelectionCount,
    state.lockedDa,
    state.lockedRegion,
    state.zoomMode,
  ]);

  if (dismissed) {
    return null;
  }

  return (
    <div className="pointer-events-none absolute inset-x-0 top-[4.75rem] z-[15] flex justify-center px-4 md:top-[5rem]">
      <div className="pointer-events-auto w-full max-w-sm md:max-w-md">
        <Card className="animate-in slide-in-from-top-2 fade-in-0 gap-0 rounded-2xl border-border/80 bg-background/92 py-0 shadow-lg backdrop-blur-sm duration-200">
          <CardHeader className="grid-cols-[1fr_auto] gap-x-3 gap-y-1 px-4 py-3">
            <div className="space-y-1">
              <CardTitle className="text-sm font-semibold">Get started</CardTitle>
              <CardDescription className="text-sm leading-5">
                Start with the regional view, then zoom in or search for a
                region, DAUID, place, or address to inspect DA-level heat
                vulnerability.
              </CardDescription>
            </div>
            <CardAction>
              <Button
                type="button"
                variant="ghost"
                size="icon-xs"
                className="text-muted-foreground hover:text-foreground"
                onClick={dismiss}
                aria-label="Dismiss getting started message"
              >
                <XIcon className="size-3.5" />
              </Button>
            </CardAction>
          </CardHeader>
        </Card>
      </div>
    </div>
  );
}
