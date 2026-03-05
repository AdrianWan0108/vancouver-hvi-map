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
    <aside
      style={{
        position: "absolute",
        top: 16,
        left: 16,
        width: 340,
        maxHeight: "calc(100vh - 32px)",
        overflow: "auto",
        background: "white",
        border: "1px solid rgba(0,0,0,0.12)",
        borderRadius: 12,
        padding: 12,
        boxShadow: "0 6px 24px rgba(0,0,0,0.12)",
        fontFamily: 'ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, Arial',
        fontSize: 13,
        lineHeight: 1.35,
        zIndex: 10,
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
        <div style={{ fontWeight: 700 }}>{panelTitle}</div>
        {panelMode === "locked" ? (
          <button
            type="button"
            onClick={() => dispatch({ type: "unlockDa" })}
            style={{
              fontSize: 12,
              padding: "4px 8px",
              borderRadius: 8,
              border: "1px solid rgba(0,0,0,0.2)",
              background: "white",
              cursor: "pointer",
            }}
            title="Unlock panel"
          >
            Unlock
          </button>
        ) : null}
      </div>

      {state.mapError ? (
        <div
          style={{
            marginTop: 8,
            padding: 8,
            borderRadius: 8,
            border: "1px solid rgba(214, 58, 58, 0.4)",
            background: "rgba(214, 58, 58, 0.08)",
            color: "rgb(135, 31, 31)",
          }}
        >
          <b>Map warning:</b> {state.mapError}
        </div>
      ) : null}

      <hr style={{ margin: "12px 0", borderColor: "rgba(0,0,0,0.08)" }} />

      {panelMode === "info" || !activeDa ? (
        <InfoModeSection
          zoomMode={state.zoomMode}
          hasLockedDa={Boolean(state.lockedDa)}
        />
      ) : (
        <div style={{ display: "grid", gap: 12 }}>
          <LayerSelect />
          <FilterMenu />
          {lockedDaFilteredOut ? (
            <div
              style={{
                border: "1px solid rgba(179, 88, 0, 0.28)",
                background: "rgba(255, 187, 0, 0.12)",
                borderRadius: 8,
                padding: 8,
                color: "rgb(95, 55, 0)",
              }}
            >
              Locked DA is currently outside active filter range.
            </div>
          ) : null}
          <DaDetailsSection da={activeDa} selectedMetric={state.selectedMetric} />
        </div>
      )}
    </aside>
  );
}
