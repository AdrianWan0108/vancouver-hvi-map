import { useEffect, useRef } from "react";
import maplibregl, { Map } from "maplibre-gl";
import { Protocol, PMTiles } from "pmtiles";

const VANCOUVER_CENTER: [number, number] = [-123.1207, 49.2827];

export default function MapView() {
  const mapRef = useRef<Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    // 1) PMTiles protocol
    const protocol = new Protocol();
    maplibregl.addProtocol("pmtiles", protocol.tile);

    // Serve PMTiles from Vite public/
    const PMTILES_URL = `${window.location.origin}/tiles/vancouver-hvi.pmtiles`;
    const pmtiles = new PMTiles(PMTILES_URL);
    protocol.add(pmtiles);

    // 2) Create map with grey basemap
    const map = new maplibregl.Map({
      container: mapContainerRef.current,
      style: "https://basemaps.cartocdn.com/gl/positron-gl-style/style.json",
      center: VANCOUVER_CENTER,
      zoom: 10,
    });

    map.addControl(new maplibregl.NavigationControl(), "top-right");
    map.addControl(
      new maplibregl.ScaleControl({ maxWidth: 200, unit: "metric" }),
      "bottom-left"
    );

    mapRef.current = map;

    map.on("load", async () => {
      // Debug: confirm internal vector layer(s)
      const meta: any = await pmtiles.getMetadata();
      const layerIds = meta?.vector_layers?.map((vl: any) => vl.id) ?? [];
      console.log("PMTiles vector layers:", layerIds); // should include "hvi"

      // 3) Add PMTiles vector source
      map.addSource("hvi", {
        type: "vector",
        url: `pmtiles://${PMTILES_URL}`,
        // Best practice: ensures feature-state works using a stable property as id
        // (Your features have DGUID)
        promoteId: "DGUID",
      });

      // 4) Add fill layer
      map.addLayer({
        id: "hvi-fill",
        type: "fill",
        source: "hvi",
        "source-layer": "hvi",
        paint: {
          "fill-color": [
            "interpolate",
            ["linear"],
            ["coalesce", ["to-number", ["get", "hvi_index_n01"]], 0],
            0,
            "#f7f7f7",
            0.5,
            "#fdae61",
            1,
            "#d7191c",
          ],
          "fill-opacity": [
            "case",
            ["boolean", ["feature-state", "hover"], false],
            0.9,
            0.55,
          ],
        },
      });

      // 5) Outline layer
      map.addLayer({
        id: "hvi-outline",
        type: "line",
        source: "hvi",
        "source-layer": "hvi",
        paint: {
          "line-color": "#333",
          "line-width": 0.6,
          "line-opacity": 0.35,
        },
      });

      // 6) Hover highlight (feature-state)
      // With promoteId:"DGUID", feature.id will be the DGUID string.
      let hoveredId: string | number | undefined;

      map.on("mousemove", "hvi-fill", (e: any) => {
        const f = e.features?.[0];
        if (!f) return;

        const fid = f.id as string | number | undefined;
        if (fid === undefined) {
          map.getCanvas().style.cursor = "pointer";
          return;
        }

        // remove previous hover
        if (hoveredId !== undefined) {
          map.setFeatureState(
            { source: "hvi", sourceLayer: "hvi", id: hoveredId },
            { hover: false }
          );
        }

        hoveredId = fid;

        // set new hover
        map.setFeatureState(
          { source: "hvi", sourceLayer: "hvi", id: hoveredId },
          { hover: true }
        );

        map.getCanvas().style.cursor = "pointer";
      });

      map.on("mouseleave", "hvi-fill", () => {
        if (hoveredId !== undefined) {
          map.setFeatureState(
            { source: "hvi", sourceLayer: "hvi", id: hoveredId },
            { hover: false }
          );
        }
        hoveredId = undefined;
        map.getCanvas().style.cursor = "";
      });

      // 7) Click popup
      map.on("click", "hvi-fill", (e: any) => {
        const f = e.features?.[0];
        if (!f) return;

        const p = (f.properties ?? {}) as Record<string, unknown>;
        const dguid = String(p.DGUID ?? "");
        const hviVal = String(p.hvi_index_n01 ?? "");

        new maplibregl.Popup()
          .setLngLat(e.lngLat)
          .setHTML(
            `<div style="font-size:12px">
              <div><b>DGUID:</b> ${dguid}</div>
              <div><b>HVI:</b> ${hviVal}</div>
            </div>`
          )
          .addTo(map);
      });
    });

    return () => {
      map.remove();
      mapRef.current = null;
      maplibregl.removeProtocol("pmtiles");
    };
  }, []);

  return (
    <div
      ref={mapContainerRef}
      style={{ width: "100%", height: "100vh" }}
    />
  );
}
