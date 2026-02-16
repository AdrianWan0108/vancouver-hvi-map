import { useEffect, useRef } from "react";
import maplibregl, { Map } from "maplibre-gl";
import { Protocol } from "pmtiles";

export default function MapView() {
  const mapRef = useRef<HTMLDivElement | null>(null);
  const mapObjRef = useRef<Map | null>(null);

  useEffect(() => {
    if (!mapRef.current || mapObjRef.current) return;

    const protocol = new Protocol();
    maplibregl.addProtocol("pmtiles", protocol.tile);

    const map = new maplibregl.Map({
      container: mapRef.current,
      center: [-123.12, 49.28],
      zoom: 9,
      style: {
        version: 8,
        sources: {
          osm: {
            type: "raster",
            tiles: ["https://tile.openstreetmap.org/{z}/{x}/{y}.png"],
            tileSize: 256,
            attribution: "© OpenStreetMap contributors",
          },
          hvi: {
            type: "vector",
            // ✅ use relative path so it works in dev + build
            url: "pmtiles:///tiles/vancouver-hvi.pmtiles",
          },
        },
        layers: [
          { id: "osm", type: "raster", source: "osm" },
          {
            id: "hvi-fill",
            type: "fill",
            source: "hvi",
            // TODO: update this after you confirm the internal source-layer name
            "source-layer": "da",
            paint: {
              "fill-opacity": 0.65,
              "fill-color": [
                "interpolate",
                ["linear"],
                ["coalesce", ["to-number", ["get", "hvi_index_n01"]], 0],
                0, "#ffffcc",
                0.5, "#fd8d3c",
                1, "#800026",
              ],
            },
          },
          {
            id: "hvi-outline",
            type: "line",
            source: "hvi",
            "source-layer": "da",
            paint: { "line-color": "#000", "line-width": 0.5, "line-opacity": 0.25 },
          },
        ],
      },
    });

    map.addControl(new maplibregl.NavigationControl(), "top-right");

    map.on("click", "hvi-fill", (e) => {
      const f = e.features?.[0];
      if (!f) return;
      const p = (f.properties ?? {}) as Record<string, unknown>;

      new maplibregl.Popup()
        .setLngLat(e.lngLat)
        .setHTML(`
          <div style="font-size:12px">
            <div><b>DGUID:</b> ${p.DGUID ?? ""}</div>
            <div><b>HVI:</b> ${p.hvi_index_n01 ?? ""}</div>
          </div>
        `)
        .addTo(map);
    });

    mapObjRef.current = map;

    return () => {
      map.remove();
      maplibregl.removeProtocol("pmtiles");
    };
  }, []);

  return <div ref={mapRef} className="h-screen w-full" />;
}
