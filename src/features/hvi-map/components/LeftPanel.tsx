import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import FilterMenu from "./FilterMenu";
import LayerSelect from "./LayerSelect";
import InfoModeSection from "./InfoModeSection";
import DaDetailsSection from "./DaDetailsSection";
import RegionDetailsSection from "./RegionDetailsSection";
import ViewOptionsSection from "./ViewOptionsSection";
import LeftPanelBrand from "./LeftPanelBrand";
import LeftPanelLabLogo from "./LeftPanelLabLogo";
import SelectedPlaceCard from "./SelectedPlaceCard";
import {
  getRegionSelectedPlaceContent,
  shouldShowDaControls,
  shouldShowInfoModeContent,
} from "./panelContent";
import { useMemo } from "react";
import {
  selectActiveDa,
  selectActiveDaRegionName,
  selectActiveRegion,
  selectIsLockedDaFilteredOut,
  selectPanelMode,
} from "../state/selectors";
import { useMapDispatch } from "../state/useMapDispatch";
import { useMapHoverState } from "../state/useMapHoverState";
import { useMapUiState } from "../state/useMapUiState";

export default function LeftPanel() {
  const uiState = useMapUiState();
  const hoverState = useMapHoverState();
  const dispatch = useMapDispatch();
  const state = useMemo(
    () => ({
      ...uiState,
      ...hoverState,
    }),
    [hoverState, uiState]
  );
  const panelMode = selectPanelMode(state);
  const activeDa = selectActiveDa(state);
  const activeDaRegionName = selectActiveDaRegionName(state);
  const activeRegion = selectActiveRegion(state);
  const lockedDaFilteredOut = selectIsLockedDaFilteredOut(state);
  const showDaControls = shouldShowDaControls(state.zoomMode);
  const showInfoMode = shouldShowInfoModeContent({
    zoomMode: state.zoomMode,
    panelMode,
    hasActiveDa: activeDa !== null,
    hasActiveRegion: activeRegion !== null,
  });
  const regionSelectedPlaceContent = getRegionSelectedPlaceContent(activeRegion);

  return (
    <aside className="flex h-full min-h-0 w-full flex-col border-b border-border/80 bg-card md:w-[24rem] md:flex-none md:border-r md:border-b-0">
      <div className="border-b border-border/80 px-4 py-2">
        <LeftPanelBrand />
      </div>

      <div className="flex min-h-0 flex-1 flex-col">
        <div
          data-hvi-panel-scroll="true"
          className="min-h-0 flex-1 overflow-auto px-5 py-4"
        >
          <div className="flex min-h-full flex-col">
            <div className="grid gap-3">
              {state.mapError ? (
                <Alert variant="destructive">
                  <AlertTitle>Map warning</AlertTitle>
                  <AlertDescription>{state.mapError}</AlertDescription>
                </Alert>
              ) : null}

              {showDaControls ? (
                <>
                  {showInfoMode ? (
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
                      {activeDa ? (
                        <DaDetailsSection
                          da={activeDa}
                          regionName={activeDaRegionName}
                        />
                      ) : null}
                    </>
                  )}
                </>
              ) : showInfoMode ? (
                <InfoModeSection zoomMode={state.zoomMode} />
              ) : (
                <>
                  {regionSelectedPlaceContent ? (
                    <SelectedPlaceCard content={regionSelectedPlaceContent} />
                  ) : null}
                  {activeRegion ? <RegionDetailsSection region={activeRegion} /> : null}
                </>
              )}
            </div>

            {showInfoMode ? (
              <div className="mt-auto flex justify-end pt-6">
                <LeftPanelLabLogo />
              </div>
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
            <ViewOptionsSection
              showPeripheralAreas={state.showPeripheralAreas}
              onShowPeripheralAreasChange={(showPeripheralAreas) =>
                dispatch({
                  type: "peripheralVisibilityChanged",
                  showPeripheralAreas,
                })
              }
            />
          </div>
        </div>
      </div>
    </aside>
  );
}
