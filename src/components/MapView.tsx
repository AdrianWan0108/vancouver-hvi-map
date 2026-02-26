import { useEffect, useMemo, useRef, useState } from "react";
import maplibregl, { Map } from "maplibre-gl";
import { Protocol, PMTiles } from "pmtiles";

const VANCOUVER_CENTER: [number, number] = [-123.1207, 49.2827];

// Zoom threshold: below shows Regions, at/above shows DA
const ZOOM_DA = 10.5;

// MapLibre layer IDs (your own names)
const LAYERS = {
  regionsFill: "regions-fill",
  regionsLine: "regions-line",
  daFill: "da-fill",
  daLine: "da-line",
};

type PropsDict = Record<string, unknown>;

function buildColorExpression(property: string) {
  // Low -> orange, high -> green (Tree Equity Score vibe)
  return [
    "interpolate",
    ["linear"],
    ["coalesce", ["to-number", ["get", property]], 0],
    0,
    "#fdae61",
    0.5,
    "#fee08b",
    1,
    "#1a9850",
  ] as any;
}

function formatScore(v: unknown) {
  const n = Number(v);
  if (!Number.isFinite(n)) return "N/A";
  return n.toFixed(3);
}

function formatNumber(v: unknown) {
  const n = Number(v);
  if (!Number.isFinite(n)) return "N/A";
  return n.toLocaleString();
}

function getStr(v: unknown) {
  if (v === null || v === undefined) return "";
  return String(v);
}

export default function MapView() {
  const mapRef = useRef<Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement | null>(null);

  // Priority 3 & 4: panel state
  const [hoveredDa, setHoveredDa] = useState<PropsDict | null>(null);
  const [lockedDa, setLockedDa] = useState<PropsDict | null>(null);
  const [lockedDguid, setLockedDguid] = useState<string | null>(null);
  const [isDaMode, setIsDaMode] = useState<boolean>(false);

  const activeDa = useMemo(() => lockedDa ?? hoveredDa, [lockedDa, hoveredDa]);

  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    // 1) PMTiles protocol
    const protocol = new Protocol();
    maplibregl.addProtocol("pmtiles", protocol.tile);

    // PMTiles served from Vite public/
    // const DA_PMTILES_URL = `${window.location.origin}/tiles/hvi_da.pmtiles`;
    // const REGIONS_PMTILES_URL = `${window.location.origin}/tiles/hvi_regions.pmtiles`;

    const base = import.meta.env.BASE_URL;
    const DA_PMTILES_URL = `${base}tiles/hvi_da.pmtiles`;
    const REGIONS_PMTILES_URL = `${base}tiles/hvi_regions.pmtiles`;

    const daPmtiles = new PMTiles(DA_PMTILES_URL);
    const regionsPmtiles = new PMTiles(REGIONS_PMTILES_URL);

    protocol.add(daPmtiles);
    protocol.add(regionsPmtiles);

    // 2) Create map
    const map = new maplibregl.Map({
      container: mapContainerRef.current,
      style: "https://basemaps.cartocdn.com/gl/positron-gl-style/style.json",
      center: VANCOUVER_CENTER,
      zoom: 9.5, // start in region view
    });

    map.addControl(new maplibregl.NavigationControl(), "top-right");
    map.addControl(
      new maplibregl.ScaleControl({ maxWidth: 200, unit: "metric" }),
      "bottom-left"
    );

    mapRef.current = map;

    // One tooltip instance reused
    const tooltip = new maplibregl.Popup({
      closeButton: false,
      closeOnClick: false,
      offset: 10,
    });

    // Hover state tracking (separate for region and DA)
    let hoveredRegionId: string | number | undefined;
    let hoveredDaId: string | number | undefined;

    const DA_SOURCE_LAYER = "hvi_da";
    const REGIONS_SOURCE_LAYER = "hvi_regions";

    const clearRegionHover = () => {
      if (hoveredRegionId !== undefined) {
        map.setFeatureState(
          { source: "regions", sourceLayer: REGIONS_SOURCE_LAYER, id: hoveredRegionId },
          { hover: false }
        );
      }
      hoveredRegionId = undefined;
    };

    const clearDaHover = () => {
      if (hoveredDaId !== undefined) {
        map.setFeatureState(
          { source: "da", sourceLayer: DA_SOURCE_LAYER, id: hoveredDaId },
          { hover: false }
        );
      }
      hoveredDaId = undefined;
    };

    const hideTooltip = () => {
      tooltip.remove();
      map.getCanvas().style.cursor = "";
    };

    const updateMode = () => {
      const z = map.getZoom();
      const daMode = z >= ZOOM_DA;
      setIsDaMode(daMode);

      // Simple rule for now: if user zooms out of DA mode, clear lock & hovered panel data
      if (!daMode) {
        setHoveredDa(null);
        setLockedDa(null);
        setLockedDguid(null);
      }
    };

    map.on("load", async () => {
      // Debug: confirm internal vector layer(s) for each pmtiles
      const daMeta: any = await daPmtiles.getMetadata();
      const regionsMeta: any = await regionsPmtiles.getMetadata();
      console.log(
        "DA PMTiles vector layers:",
        daMeta?.vector_layers?.map((vl: any) => vl.id) ?? []
      );
      console.log(
        "Regions PMTiles vector layers:",
        regionsMeta?.vector_layers?.map((vl: any) => vl.id) ?? []
      );

      // 3) Add vector sources
      map.addSource("da", {
        type: "vector",
        url: `pmtiles://${DA_PMTILES_URL}`,
        promoteId: "DGUID",
      });

      map.addSource("regions", {
        type: "vector",
        url: `pmtiles://${REGIONS_PMTILES_URL}`,
        promoteId: "MunNum",
      });

      // 4) Choropleth expressions
      const regionFillColor = buildColorExpression("region_hvi_n01");
      const daFillColor = buildColorExpression("hvi_index_n01");

      // 5) Regions fill + outline
      map.addLayer({
        id: LAYERS.regionsFill,
        type: "fill",
        source: "regions",
        "source-layer": REGIONS_SOURCE_LAYER,
        maxzoom: ZOOM_DA,
        paint: {
          "fill-color": regionFillColor,
          "fill-outline-color": regionFillColor,
          "fill-opacity": [
            "case",
            ["boolean", ["feature-state", "hover"], false],
            0.92,
            0.75,
          ],
        },
      });

      map.addLayer({
        id: LAYERS.regionsLine,
        type: "line",
        source: "regions",
        "source-layer": REGIONS_SOURCE_LAYER,
        maxzoom: ZOOM_DA,
        paint: {
          "line-width": [
            "case",
            ["boolean", ["feature-state", "hover"], false],
            2,
            1,
          ],
          "line-opacity": 0.25,
        },
      });

      // 6) DA fill + outline
      map.addLayer({
        id: LAYERS.daFill,
        type: "fill",
        source: "da",
        "source-layer": DA_SOURCE_LAYER,
        minzoom: ZOOM_DA,
        paint: {
          "fill-color": daFillColor,
          "fill-outline-color": daFillColor,
          "fill-opacity": [
            "case",
            ["boolean", ["feature-state", "hover"], false],
            0.92,
            0.75,
          ],
        },
      });

      map.addLayer({
        id: LAYERS.daLine,
        type: "line",
        source: "da",
        "source-layer": DA_SOURCE_LAYER,
        minzoom: ZOOM_DA,
        paint: {
          "line-width": [
            "case",
            ["boolean", ["feature-state", "hover"], false],
            1.6,
            0.6,
          ],
          "line-opacity": 0.2,
        },
      });

      // --- Priority 2: Hover tooltip + hover highlight (already working) ---
      map.on("mousemove", LAYERS.regionsFill, (e: any) => {
        if (map.getZoom() >= ZOOM_DA) return;
        const f = e.features?.[0];
        if (!f) return;

        const fid = f.id as string | number | undefined;
        if (fid === undefined) return;

        if (hoveredRegionId !== fid) {
          clearRegionHover();
          hoveredRegionId = fid;
          map.setFeatureState(
            { source: "regions", sourceLayer: REGIONS_SOURCE_LAYER, id: fid },
            { hover: true }
          );
        }

        const p = (f.properties ?? {}) as PropsDict;
        const name = getStr(p.ShortName ?? p.FullName ?? "Region");
        const score = formatScore(p.region_hvi_n01);

        tooltip
          .setLngLat(e.lngLat)
          .setHTML(
            `<div style="font-size:12px; line-height:1.2;">
              <div style="font-weight:600; margin-bottom:4px;">${name}</div>
              <div><b>Composite HVI:</b> ${score}</div>
            </div>`
          )
          .addTo(map);

        map.getCanvas().style.cursor = "pointer";
      });

      map.on("mouseleave", LAYERS.regionsFill, () => {
        clearRegionHover();
        hideTooltip();
      });

      // --- Priority 3: DA hover updates left panel WHEN not locked ---
      map.on("mousemove", LAYERS.daFill, (e: any) => {
        if (map.getZoom() < ZOOM_DA) return;

        const f = e.features?.[0];
        if (!f) return;

        const fid = f.id as string | number | undefined;
        if (fid === undefined) return;

        // hover highlight
        if (hoveredDaId !== fid) {
          clearDaHover();
          hoveredDaId = fid;
          map.setFeatureState(
            { source: "da", sourceLayer: DA_SOURCE_LAYER, id: fid },
            { hover: true }
          );
        }

        const p = (f.properties ?? {}) as PropsDict;

        // tooltip
        const dguid = getStr(p.DGUID ?? "DA");
        const score = formatScore(p.hvi_index_n01);
        tooltip
          .setLngLat(e.lngLat)
          .setHTML(
            `<div style="font-size:12px; line-height:1.2;">
              <div style="font-weight:600; margin-bottom:4px;">DA ${dguid}</div>
              <div><b>HVI:</b> ${score}</div>
            </div>`
          )
          .addTo(map);

        map.getCanvas().style.cursor = "pointer";

        // panel follows hover only if NOT locked
        if (!lockedDguid) {
          setHoveredDa(p);
        }
      });

      map.on("mouseleave", LAYERS.daFill, () => {
        clearDaHover();
        hideTooltip();
        if (!lockedDguid) setHoveredDa(null);
      });

      // --- Priority 4: Click locks/unlocks the left panel (map hover stays the same) ---
      map.on("click", LAYERS.daFill, (e: any) => {
        if (map.getZoom() < ZOOM_DA) return;

        const f = e.features?.[0];
        if (!f) return;

        const p = (f.properties ?? {}) as PropsDict;
        const dguid = getStr(p.DGUID ?? "");

        if (!dguid) return;

        // Click same DA -> unlock
        if (lockedDguid === dguid) {
          setLockedDguid(null);
          setLockedDa(null);
          // after unlock, panel should follow current hover (if any)
          setHoveredDa(p);
          return;
        }

        // Click new DA -> lock on it (also replaces any existing lock)
        setLockedDguid(dguid);
        setLockedDa(p);
      });

      // When zoom crosses threshold, clear tooltip + highlight; update mode & reset lock if leaving DA mode
      updateMode();
      map.on("zoom", () => {
        const z = map.getZoom();

        if (z < ZOOM_DA) {
          clearDaHover();
        } else {
          clearRegionHover();
        }
        hideTooltip();
        updateMode();
      });
    });

    return () => {
      tooltip.remove();
      map.remove();
      mapRef.current = null;
      maplibregl.removeProtocol("pmtiles");
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lockedDguid]);

  // --- Basic left panel UI (temporary; can be replaced later with shadcn Sheet/Card) ---
  const panelTitle = lockedDguid
    ? `Locked DA: ${lockedDguid}`
    : activeDa?.DGUID
      ? `Hovering DA: ${String(activeDa.DGUID)}`
      : "DA Details";

  return (
    <div style={{ position: "relative", width: "100%", height: "100vh" }}>
      {/* Map */}
      <div ref={mapContainerRef} style={{ width: "100%", height: "100%" }} />

      {/* Left Panel (basic) */}
      <div
        style={{
          position: "absolute",
          top: 16,
          left: 16,
          width: 320,
          maxHeight: "calc(100vh - 32px)",
          overflow: "auto",
          background: "white",
          border: "1px solid rgba(0,0,0,0.12)",
          borderRadius: 12,
          padding: 12,
          boxShadow: "0 6px 24px rgba(0,0,0,0.12)",
          fontFamily:
            'ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, Arial',
          fontSize: 13,
          lineHeight: 1.35,
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <div style={{ fontWeight: 700 }}>{panelTitle}</div>
          {lockedDguid ? (
            <button
              onClick={() => {
                setLockedDguid(null);
                setLockedDa(null);
              }}
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

        <div style={{ marginTop: 8, color: "rgba(0,0,0,0.7)" }}>
          {isDaMode ? (
            lockedDguid ? (
              "Panel is locked. Hover still changes tooltip on the map."
            ) : (
              "Hover a DA to see details. Click a DA to lock."
            )
          ) : (
            "Zoom in to DA level to view DA details."
          )}
        </div>

        <hr style={{ margin: "12px 0", borderColor: "rgba(0,0,0,0.08)" }} />

        {!isDaMode ? null : !activeDa ? (
          <div style={{ color: "rgba(0,0,0,0.6)" }}>No DA selected.</div>
        ) : (
          <div style={{ display: "grid", gap: 10 }}>
            {/* MVP fields */}
            <div>
              <div style={{ fontWeight: 700, marginBottom: 4 }}>HVI</div>
              <div>
                <b>HVI (0–1):</b> {formatScore(activeDa.hvi_index_n01)}
              </div>
              <div>
                <b>Sensitivity:</b> {formatScore(activeDa.sensitivity_index)}
              </div>
              <div>
                <b>Adaptive Capacity:</b>{" "}
                {formatScore(activeDa.adaptive_capacity_index)}
              </div>
              <div>
                <b>Exposure Index:</b> {formatScore(activeDa.exposure_index)}
              </div>
            </div>

            <div>
              <div style={{ fontWeight: 700, marginBottom: 4 }}>Key stats</div>
              <div>
                <b>Population:</b> {formatNumber(activeDa.pop_total)}
              </div>
              <div>
                <b>Unemployment rate:</b> {getStr(activeDa.unemployment_rate)}
              </div>
              <div>
                <b>Low income rate:</b> {getStr(activeDa.low_income_rate)}
              </div>
              <div>
                <b>% Seniors 65+:</b> {getStr(activeDa.pct_seniors_65plus)}
              </div>
              <div>
                <b>% Living alone:</b> {getStr(activeDa.pct_living_alone)}
              </div>
            </div>

            <div>
              <div style={{ fontWeight: 700, marginBottom: 4 }}>Greenness</div>
              <div>
                <b>Green fraction:</b> {formatScore(activeDa.green_frac)}
              </div>
              <div>
                <b>Coniferous:</b> {formatScore(activeDa.frac_coniferous)}
              </div>
              <div>
                <b>Deciduous:</b> {formatScore(activeDa.frac_deciduous)}
              </div>
              <div>
                <b>Shrub:</b> {formatScore(activeDa.frac_shrub)}
              </div>
              <div>
                <b>Modified herb:</b> {formatScore(activeDa.frac_modified_herb)}
              </div>
              <div>
                <b>Natural herb:</b> {formatScore(activeDa.frac_natural_herb)}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}