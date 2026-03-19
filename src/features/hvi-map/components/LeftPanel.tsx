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
import { DA_METRICS_BY_ID } from "../config/daMetrics";
import { REGION_HVI_METRIC } from "../config/regionConfig";
import FilterMenu from "./FilterMenu";
import LayerSelect from "./LayerSelect";
import InfoModeSection from "./InfoModeSection";
import DaDetailsSection from "./DaDetailsSection";
import MetricLegend from "./MetricLegend";
import RegionDetailsSection from "./RegionDetailsSection";
import ViewOptionsSection from "./ViewOptionsSection";
import { shouldShowDaControls, shouldShowViewOptions } from "./panelContent";
import { useMapState } from "../state/useMapState";
import {
  selectActiveDa,
  selectActiveRegion,
  selectIsLockedDaFilteredOut,
  selectPanelMode,
} from "../state/selectors";
import { getRegionDisplayName } from "../utils/region";

function getPanelTitle(
  panelMode: ReturnType<typeof selectPanelMode>,
  zoomMode: "region" | "da",
  activeDaDguid: string | null,
  activeRegionName: string | null
): string {
  if (zoomMode === "region") {
    if (panelMode === "locked" && activeRegionName) {
      return `Locked Region: ${activeRegionName}`;
    }
    if (panelMode === "hover" && activeRegionName) {
      return `Hovering Region: ${activeRegionName}`;
    }
    return "Regional Summary";
  }

  if (panelMode === "locked" && activeDaDguid) return `Locked DA: ${activeDaDguid}`;
  if (panelMode === "hover" && activeDaDguid) return `Hovering DA: ${activeDaDguid}`;
  return "DA Details";
}

export default function LeftPanel() {
  const { state, dispatch } = useMapState();
  const panelMode = selectPanelMode(state);
  const activeDa = selectActiveDa(state);
  const activeRegion = selectActiveRegion(state);
  const lockedDaFilteredOut = selectIsLockedDaFilteredOut(state);
  const activeRegionName = getRegionDisplayName(activeRegion);
  const panelTitle = getPanelTitle(
    panelMode,
    state.zoomMode,
    activeDa?.DGUID ?? null,
    activeRegionName
  );
  const activeLegendMetric =
    state.zoomMode === "da"
      ? DA_METRICS_BY_ID[state.selectedMetric]
      : REGION_HVI_METRIC;
  const activeLegendCategory =
    state.zoomMode === "da"
      ? DA_METRICS_BY_ID[state.selectedMetric].category
      : "Region";
  const canUnlockActiveFeature =
    (state.zoomMode === "da" && Boolean(state.lockedDa)) ||
    (state.zoomMode === "region" && Boolean(state.lockedRegion));

  return (
    <aside className="absolute left-4 top-4 z-10 w-[min(24rem,calc(100vw-2rem))]">
      <Card className="h-[calc(100vh-2rem)] overflow-hidden border-border/80 bg-card/95 shadow-lg backdrop-blur-sm">
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
            Heat vulnerability explorer for Metro Vancouver dissemination areas
            and regional summaries.
          </CardDescription>
          {panelMode === "locked" && canUnlockActiveFeature ? (
            <CardAction>
              <Button
                type="button"
                variant="outline"
                size="xs"
                onClick={() =>
                  dispatch(
                    state.zoomMode === "da"
                      ? { type: "unlockDa" }
                      : { type: "unlockRegion" }
                  )
                }
                title="Unlock panel"
              >
                Unlock
              </Button>
            </CardAction>
          ) : null}
        </CardHeader>

        <Separator />

        <CardContent className="flex min-h-0 flex-1 flex-col gap-4 overflow-auto px-5 py-4">
          {state.mapError ? (
            <Alert variant="destructive">
              <AlertTitle>Map warning</AlertTitle>
              <AlertDescription>{state.mapError}</AlertDescription>
            </Alert>
          ) : null}

          {shouldShowViewOptions(state.zoomMode) ? (
            <ViewOptionsSection
              zoomMode={state.zoomMode}
              showPeripheralAreas={state.showPeripheralAreas}
              onShowPeripheralAreasChange={(showPeripheralAreas) =>
                dispatch({
                  type: "peripheralVisibilityChanged",
                  showPeripheralAreas,
                })
              }
            />
          ) : null}

          <MetricLegend
            label={activeLegendMetric.label}
            category={activeLegendCategory}
            paletteId={activeLegendMetric.paletteId}
            format={activeLegendMetric.format}
            domainMin={activeLegendMetric.domainMin}
            domainMax={activeLegendMetric.domainMax}
          />

          {shouldShowDaControls(state.zoomMode) ? (
            <>
              <LayerSelect />
              <FilterMenu />
              {panelMode === "info" || !activeDa ? (
                <div className="flex min-h-0 flex-1">
                  <InfoModeSection
                    zoomMode={state.zoomMode}
                    hasLockedDa={Boolean(state.lockedDa)}
                    hasLockedRegion={Boolean(state.lockedRegion)}
                  />
                </div>
              ) : (
                <>
                  {lockedDaFilteredOut ? (
                    <Alert variant="warning">
                      <AlertTitle>Filtered out</AlertTitle>
                      <AlertDescription>
                        Locked DA is currently outside active filter range.
                      </AlertDescription>
                    </Alert>
                  ) : null}
                  <DaDetailsSection
                    key={activeDa.DGUID}
                    da={activeDa}
                    selectedMetric={state.selectedMetric}
                  />
                </>
              )}
            </>
          ) : panelMode === "info" || !activeRegion ? (
            <div className="flex min-h-0 flex-1">
              <InfoModeSection
                zoomMode={state.zoomMode}
                hasLockedDa={Boolean(state.lockedDa)}
                hasLockedRegion={Boolean(state.lockedRegion)}
              />
            </div>
          ) : (
            <RegionDetailsSection region={activeRegion} />
          )}
        </CardContent>
      </Card>
    </aside>
  );
}
