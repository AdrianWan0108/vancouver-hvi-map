import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import FilterMenu from "./FilterMenu";
import LayerSelect from "./LayerSelect";
import InfoModeSection from "./InfoModeSection";
import DaDetailsSection from "./DaDetailsSection";
import { useMapState } from "../state/useMapState";
import {
  selectActiveDa,
  selectIsLockedDaFilteredOut,
  selectPanelMode,
} from "../state/selectors";

function getPanelTitle(
  panelMode: ReturnType<typeof selectPanelMode>,
  activeDaDguid: string | null
): string {
  if (panelMode === "locked" && activeDaDguid) return `Locked DA: ${activeDaDguid}`;
  if (panelMode === "hover" && activeDaDguid) return `Hovering DA: ${activeDaDguid}`;
  return "DA Details";
}

export default function LeftPanel() {
  const { state, dispatch } = useMapState();
  const panelMode = selectPanelMode(state);
  const activeDa = selectActiveDa(state);
  const lockedDaFilteredOut = selectIsLockedDaFilteredOut(state);
  const panelTitle = getPanelTitle(panelMode, activeDa?.DGUID ?? null);

  return (
    <aside className="absolute left-4 top-4 z-10 w-[min(24rem,calc(100vw-2rem))]">
      <Card className="max-h-[calc(100vh-2rem)] overflow-hidden border-border/80 bg-card/95 shadow-lg backdrop-blur-sm">
        <CardHeader className="gap-3 px-5 py-4">
          <div className="flex items-center gap-2">
            <Badge variant={panelMode === "locked" ? "default" : "secondary"}>
              {panelMode === "locked"
                ? "Locked"
                : panelMode === "hover"
                  ? "Hover"
                  : state.zoomMode === "region"
                    ? "Region"
                    : "Info"}
            </Badge>
            {state.zoomMode === "da" ? (
              <Badge variant="outline">DA Mode</Badge>
            ) : (
              <Badge variant="outline">Region Mode</Badge>
            )}
          </div>
          <CardTitle className="text-base">{panelTitle}</CardTitle>
          <CardDescription>
            Heat vulnerability explorer for Vancouver dissemination areas and
            regional summaries.
          </CardDescription>
          {panelMode === "locked" ? (
            <CardAction>
              <Button
                type="button"
                variant="outline"
                size="xs"
                onClick={() => dispatch({ type: "unlockDa" })}
                title="Unlock panel"
              >
                Unlock
              </Button>
            </CardAction>
          ) : null}
        </CardHeader>

        <Separator />

        <CardContent className="grid gap-4 overflow-auto px-5 py-4">
          {state.mapError ? (
            <Alert variant="destructive">
              <AlertTitle>Map warning</AlertTitle>
              <AlertDescription>{state.mapError}</AlertDescription>
            </Alert>
          ) : null}

          {panelMode === "info" || !activeDa ? (
            <InfoModeSection
              zoomMode={state.zoomMode}
              hasLockedDa={Boolean(state.lockedDa)}
            />
          ) : (
            <>
              <LayerSelect />
              <FilterMenu />
              {lockedDaFilteredOut ? (
                <Alert variant="warning">
                  <AlertTitle>Filtered out</AlertTitle>
                  <AlertDescription>
                    Locked DA is currently outside active filter range.
                  </AlertDescription>
                </Alert>
              ) : null}
              <DaDetailsSection da={activeDa} selectedMetric={state.selectedMetric} />
            </>
          )}
        </CardContent>
      </Card>
    </aside>
  );
}
