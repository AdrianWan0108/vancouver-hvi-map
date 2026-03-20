import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { DA_METRICS_BY_ID } from "../config/daMetrics";
import { REGION_HVI_METRIC } from "../config/regionConfig";
import FilterMenu from "./FilterMenu";
import LayerSelect from "./LayerSelect";
import InfoModeSection from "./InfoModeSection";
import DaDetailsSection from "./DaDetailsSection";
import MetricLegend from "./MetricLegend";
import RegionDetailsSection from "./RegionDetailsSection";
import ViewOptionsSection from "./ViewOptionsSection";
import {
  getPanelHeaderContent,
  shouldShowDaControls,
  shouldShowViewOptions,
} from "./panelContent";
import { useMapState } from "../state/useMapState";
import {
  selectActiveDa,
  selectActiveDaRegionName,
  selectActiveRegion,
  selectIsLockedDaFilteredOut,
  selectPanelMode,
} from "../state/selectors";
import { getRegionDisplayName } from "../utils/region";

export default function LeftPanel() {
  const { state, dispatch } = useMapState();
  const panelMode = selectPanelMode(state);
  const activeDa = selectActiveDa(state);
  const activeDaRegionName = selectActiveDaRegionName(state);
  const activeRegion = selectActiveRegion(state);
  const lockedDaFilteredOut = selectIsLockedDaFilteredOut(state);
  const activeRegionName = getRegionDisplayName(activeRegion);
  const headerContent = getPanelHeaderContent({
    zoomMode: state.zoomMode,
    activeDaDauid: activeDa?.DAUID ?? null,
    activeDaRegionName,
    activeRegionName,
  });
  const activeLegendMetric =
    state.zoomMode === "da"
      ? DA_METRICS_BY_ID[state.selectedMetric]
      : REGION_HVI_METRIC;
  const activeLegendCategory =
    state.zoomMode === "da"
      ? DA_METRICS_BY_ID[state.selectedMetric].category
      : "Region";

  return (
    <aside className="flex h-full min-h-0 w-full flex-col border-b border-border/80 bg-card md:w-[24rem] md:flex-none md:border-r md:border-b-0">
      <div className="border-b border-border/80 px-5 py-4">
        <h1 className="text-base font-semibold">{headerContent.title}</h1>
        {headerContent.subtitle ? (
          <p className="mt-1 text-sm text-muted-foreground">
            {headerContent.subtitle}
          </p>
        ) : null}
      </div>

      <div className="flex min-h-0 flex-1 flex-col">
        <div className="min-h-0 flex-1 overflow-auto px-5 py-4">
          <div className="grid gap-4">
            {state.mapError ? (
              <Alert variant="destructive">
                <AlertTitle>Map warning</AlertTitle>
                <AlertDescription>{state.mapError}</AlertDescription>
              </Alert>
            ) : null}

            {shouldShowDaControls(state.zoomMode) ? (
              <>
                {panelMode === "info" || !activeDa ? (
                  <InfoModeSection zoomMode={state.zoomMode} />
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
                    <DaDetailsSection key={activeDa.DGUID} da={activeDa} />
                  </>
                )}
              </>
            ) : panelMode === "info" || !activeRegion ? (
              <InfoModeSection zoomMode={state.zoomMode} />
            ) : (
              <RegionDetailsSection region={activeRegion} />
            )}

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
          </div>
        </div>

        <div className="shrink-0 border-t border-border/80 px-5 py-4">
          <div className="grid gap-4">
            {shouldShowDaControls(state.zoomMode) ? (
              <>
                <LayerSelect />
                <FilterMenu />
              </>
            ) : null}

            <MetricLegend
              label={activeLegendMetric.label}
              category={activeLegendCategory}
              paletteId={activeLegendMetric.paletteId}
              format={activeLegendMetric.format}
              domainMin={activeLegendMetric.domainMin}
              domainMax={activeLegendMetric.domainMax}
            />
          </div>
        </div>
      </div>
    </aside>
  );
}
