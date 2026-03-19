import { useEffect, useRef, type RefObject } from "react";
import maplibregl, { Map } from "maplibre-gl";
import type { MapGeoJSONFeature, MapLayerMouseEvent, MapMouseEvent } from "maplibre-gl";
import { PMTiles, Protocol } from "pmtiles";
import { DA_METRICS_BY_ID, DEFAULT_DA_METRIC_ID } from "../config/daMetrics";
import {
  PERIPHERAL_REGION_POPULATION_THRESHOLD,
  REGION_HVI_METRIC,
  VANCOUVER_CENTER,
  ZOOM_DA,
} from "../config/regionConfig";
import type {
  DaFeatureProperties,
  FeatureId,
  RegionFeatureProperties,
} from "../types/data";
import { formatMetricValue, formatScore } from "../utils/format";
import { getRegionDisplayName } from "../utils/region";
import {
  buildDaFillOpacityExpression,
  buildFillColorExpression,
  buildFilterExpression,
  buildLineWidthExpression,
  buildRegionVisibilityFilterExpression,
} from "./expressions";
import { MAP_LAYERS, MAP_SOURCES, SOURCE_LAYERS } from "./layers";
import { getPmtilesUrls } from "./sources";
import { useMapState } from "../state/useMapState";

function getFeatureId(feature: MapGeoJSONFeature): FeatureId | undefined {
  if (typeof feature.id === "string" || typeof feature.id === "number") {
    return feature.id;
  }
  return undefined;
}

function toDaFeatureProperties(
  feature: MapGeoJSONFeature | undefined
): DaFeatureProperties | null {
  if (!feature?.properties) return null;
  const properties = feature.properties as Record<string, unknown>;
  const dguid = properties.DGUID;
  if (dguid === null || dguid === undefined) return null;
  return {
    ...properties,
    DGUID: String(dguid),
  } as DaFeatureProperties;
}

function toRegionFeatureProperties(
  feature: MapGeoJSONFeature | undefined
): RegionFeatureProperties | null {
  if (!feature?.properties) return null;
  return feature.properties as RegionFeatureProperties;
}

function getTooltipMetricLabel(metricId: string, label: string): string {
  return metricId === DEFAULT_DA_METRIC_ID ? "HVI" : label;
}

function buildPopupContent({
  title,
  label,
  value,
}: {
  title?: string;
  label: string;
  value: string;
}): HTMLElement {
  const wrapper = document.createElement("div");
  wrapper.className = "map-tooltip";

  if (title) {
    const titleEl = document.createElement("div");
    titleEl.className = "map-tooltip__title";
    titleEl.textContent = title;
    wrapper.appendChild(titleEl);
  }

  const labelEl = document.createElement("div");
  labelEl.className = "map-tooltip__label";
  labelEl.textContent = label;
  wrapper.appendChild(labelEl);

  const valueEl = document.createElement("div");
  valueEl.className = "map-tooltip__value";
  valueEl.textContent = value;
  wrapper.appendChild(valueEl);

  return wrapper;
}

export function useMapController(containerRef: RefObject<HTMLDivElement | null>) {
  const { state, dispatch } = useMapState();

  const mapRef = useRef<Map | null>(null);
  const tooltipRef = useRef<maplibregl.Popup | null>(null);
  const hoveredRegionIdRef = useRef<FeatureId | undefined>(undefined);
  const hoveredDaIdRef = useRef<FeatureId | undefined>(undefined);
  const stateRef = useRef(state);

  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const protocol = new Protocol();
    maplibregl.addProtocol("pmtiles", protocol.tile);

    const pmtilesUrls = getPmtilesUrls(import.meta.env.BASE_URL);
    const daPmtiles = new PMTiles(pmtilesUrls.da);
    const regionsPmtiles = new PMTiles(pmtilesUrls.regions);
    protocol.add(daPmtiles);
    protocol.add(regionsPmtiles);

    const map = new maplibregl.Map({
      container: containerRef.current,
      style: "https://basemaps.cartocdn.com/gl/positron-gl-style/style.json",
      center: VANCOUVER_CENTER,
      zoom: 9.5,
    });

    map.addControl(new maplibregl.NavigationControl(), "top-right");
    map.addControl(
      new maplibregl.ScaleControl({ maxWidth: 200, unit: "metric" }),
      "bottom-left"
    );

    const tooltip = new maplibregl.Popup({
      className: "map-tooltip-popup",
      closeButton: false,
      closeOnClick: false,
      offset: 10,
    });

    mapRef.current = map;
    tooltipRef.current = tooltip;

    const hideTooltip = () => {
      tooltip.remove();
      map.getCanvas().style.cursor = "";
    };

    const clearRegionHover = () => {
      if (hoveredRegionIdRef.current === undefined) return;
      if (!map.getSource(MAP_SOURCES.regions)) return;
      map.setFeatureState(
        {
          source: MAP_SOURCES.regions,
          sourceLayer: SOURCE_LAYERS.regions,
          id: hoveredRegionIdRef.current,
        },
        { hover: false }
      );
      hoveredRegionIdRef.current = undefined;
    };

    const clearDaHover = () => {
      if (hoveredDaIdRef.current === undefined) return;
      if (!map.getSource(MAP_SOURCES.da)) return;
      map.setFeatureState(
        {
          source: MAP_SOURCES.da,
          sourceLayer: SOURCE_LAYERS.da,
          id: hoveredDaIdRef.current,
        },
        { hover: false }
      );
      hoveredDaIdRef.current = undefined;
    };

    const updateZoomMode = () => {
      const zoomMode = map.getZoom() >= ZOOM_DA ? "da" : "region";
      dispatch({ type: "zoomModeChanged", zoomMode });
      hideTooltip();

      if (zoomMode === "da") {
        clearRegionHover();
      } else {
        clearDaHover();
        dispatch({ type: "hoveredDaChanged", da: null });
      }
    };

    map.on("error", (event) => {
      const message =
        event.error instanceof Error ? event.error.message : "Map rendering error";
      console.error("Map error:", event.error);
      dispatch({ type: "mapErrorChanged", message });
    });

    map.on("load", () => {
      try {
        const metric = DA_METRICS_BY_ID[stateRef.current.selectedMetric];
        const daFilterExpression = buildFilterExpression(
          stateRef.current.filters,
          DA_METRICS_BY_ID
        );
        const regionVisibilityFilter = buildRegionVisibilityFilterExpression(
          stateRef.current.showPeripheralAreas,
          PERIPHERAL_REGION_POPULATION_THRESHOLD
        );
        const regionFillColor = buildFillColorExpression(REGION_HVI_METRIC);
        const daFillColor = buildFillColorExpression(metric);

        map.addSource(MAP_SOURCES.da, {
          type: "vector",
          url: `pmtiles://${pmtilesUrls.da}`,
          promoteId: "DGUID",
        });
        map.addSource(MAP_SOURCES.regions, {
          type: "vector",
          url: `pmtiles://${pmtilesUrls.regions}`,
          promoteId: "MunNum",
        });

        map.addLayer({
          id: MAP_LAYERS.regionsFill,
          type: "fill",
          source: MAP_SOURCES.regions,
          "source-layer": SOURCE_LAYERS.regions,
          maxzoom: ZOOM_DA,
          ...(regionVisibilityFilter === true
            ? {}
            : { filter: regionVisibilityFilter }),
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
          id: MAP_LAYERS.regionsLine,
          type: "line",
          source: MAP_SOURCES.regions,
          "source-layer": SOURCE_LAYERS.regions,
          maxzoom: ZOOM_DA,
          ...(regionVisibilityFilter === true
            ? {}
            : { filter: regionVisibilityFilter }),
          paint: {
            "line-width": buildLineWidthExpression(2, 1),
            "line-opacity": 0.25,
          },
        });

        map.addLayer({
          id: MAP_LAYERS.daFill,
          type: "fill",
          source: MAP_SOURCES.da,
          "source-layer": SOURCE_LAYERS.da,
          minzoom: ZOOM_DA,
          paint: {
            "fill-color": daFillColor,
            "fill-outline-color": daFillColor,
            "fill-opacity": buildDaFillOpacityExpression(metric, daFilterExpression),
          },
        });

        map.addLayer({
          id: MAP_LAYERS.daLine,
          type: "line",
          source: MAP_SOURCES.da,
          "source-layer": SOURCE_LAYERS.da,
          minzoom: ZOOM_DA,
          paint: {
            "line-width": buildLineWidthExpression(1.6, 0.6),
            "line-opacity": 0.2,
          },
        });
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : "Unable to initialize map sources and layers.";
        console.error("Failed to initialize map layers:", error);
        dispatch({ type: "mapErrorChanged", message });
      }

      updateZoomMode();

      map.on("zoom", updateZoomMode);

      map.on("mousemove", MAP_LAYERS.regionsFill, (event: MapLayerMouseEvent) => {
        if (stateRef.current.zoomMode !== "region") return;
        const feature = event.features?.[0];
        if (!feature) return;

        const featureId = getFeatureId(feature);
        if (featureId === undefined) return;

        if (hoveredRegionIdRef.current !== featureId) {
          clearRegionHover();
          hoveredRegionIdRef.current = featureId;
          map.setFeatureState(
            {
              source: MAP_SOURCES.regions,
              sourceLayer: SOURCE_LAYERS.regions,
              id: featureId,
            },
            { hover: true }
          );
        }

        const properties = toRegionFeatureProperties(feature);
        const regionName = getRegionDisplayName(properties) ?? undefined;
        const score = formatScore(properties?.[REGION_HVI_METRIC.propertyKey]);

        if (properties && !stateRef.current.lockedRegion) {
          dispatch({ type: "hoveredRegionChanged", region: properties });
        }

        tooltip
          .setLngLat(event.lngLat)
          .setDOMContent(
            buildPopupContent({
              title: regionName,
              label: REGION_HVI_METRIC.label,
              value: score,
            })
          )
          .addTo(map);

        map.getCanvas().style.cursor = "pointer";
      });

      map.on("mouseleave", MAP_LAYERS.regionsFill, () => {
        clearRegionHover();
        hideTooltip();
        if (!stateRef.current.lockedRegion) {
          dispatch({ type: "hoveredRegionChanged", region: null });
        }
      });

      map.on("mousemove", MAP_LAYERS.daFill, (event: MapLayerMouseEvent) => {
        if (stateRef.current.zoomMode !== "da") return;
        const feature = event.features?.[0];
        if (!feature) return;

        const featureId = getFeatureId(feature);
        if (featureId === undefined) return;

        if (hoveredDaIdRef.current !== featureId) {
          clearDaHover();
          hoveredDaIdRef.current = featureId;
          map.setFeatureState(
            {
              source: MAP_SOURCES.da,
              sourceLayer: SOURCE_LAYERS.da,
              id: featureId,
            },
            { hover: true }
          );
        }

        const da = toDaFeatureProperties(feature);
        if (!da) return;

        const metric = DA_METRICS_BY_ID[stateRef.current.selectedMetric];
        const tooltipLabel = getTooltipMetricLabel(metric.id, metric.label);
        const tooltipValue = formatMetricValue(metric, da[metric.propertyKey]);

        tooltip
          .setLngLat(event.lngLat)
          .setDOMContent(
            buildPopupContent({
              label: tooltipLabel,
              value: tooltipValue,
            })
          )
          .addTo(map);

        map.getCanvas().style.cursor = "pointer";

        if (!stateRef.current.lockedDa) {
          dispatch({ type: "hoveredDaChanged", da });
        }
      });

      map.on("mouseleave", MAP_LAYERS.daFill, () => {
        clearDaHover();
        hideTooltip();
        if (!stateRef.current.lockedDa) {
          dispatch({ type: "hoveredDaChanged", da: null });
        }
      });

      map.on("mousemove", (event: MapMouseEvent) => {
        const currentState = stateRef.current;
        if (currentState.zoomMode === "region") {
          if (currentState.lockedRegion) return;

          const features = map.queryRenderedFeatures(event.point, {
            layers: [MAP_LAYERS.regionsFill],
          });

          if (features.length === 0) {
            clearRegionHover();
            hideTooltip();
            dispatch({ type: "hoveredRegionChanged", region: null });
          }
          return;
        }

        if (currentState.lockedDa) return;

        const features = map.queryRenderedFeatures(event.point, {
          layers: [MAP_LAYERS.daFill],
        });
        if (features.length === 0) {
          clearDaHover();
          hideTooltip();
          dispatch({ type: "hoveredDaChanged", da: null });
        }
      });

      map.on("click", MAP_LAYERS.regionsFill, (event: MapLayerMouseEvent) => {
        if (stateRef.current.zoomMode !== "region") return;
        const feature = event.features?.[0];
        if (!feature) return;

        const region = toRegionFeatureProperties(feature);
        if (!region) return;

        dispatch({ type: "regionClicked", region });
      });

      map.on("click", MAP_LAYERS.daFill, (event: MapLayerMouseEvent) => {
        if (stateRef.current.zoomMode !== "da") return;
        const feature = event.features?.[0];
        if (!feature) return;

        const da = toDaFeatureProperties(feature);
        if (!da) return;

        dispatch({ type: "daClicked", da });
      });
    });

    return () => {
      tooltip.remove();
      map.remove();
      mapRef.current = null;
      tooltipRef.current = null;
      maplibregl.removeProtocol("pmtiles");
    };
  }, [containerRef, dispatch]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    if (!map.getLayer(MAP_LAYERS.daFill)) return;

    const metric = DA_METRICS_BY_ID[state.selectedMetric];
    const fillColor = buildFillColorExpression(metric);
    const filterExpression = buildFilterExpression(state.filters, DA_METRICS_BY_ID);
    const fillOpacity = buildDaFillOpacityExpression(metric, filterExpression);

    map.setPaintProperty(MAP_LAYERS.daFill, "fill-color", fillColor);
    map.setPaintProperty(MAP_LAYERS.daFill, "fill-outline-color", fillColor);
    map.setPaintProperty(MAP_LAYERS.daFill, "fill-opacity", fillOpacity);
  }, [state.filters, state.selectedMetric]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    if (!map.getLayer(MAP_LAYERS.regionsFill)) return;

    const regionVisibilityFilter = buildRegionVisibilityFilterExpression(
      state.showPeripheralAreas,
      PERIPHERAL_REGION_POPULATION_THRESHOLD
    );
    const nextFilter =
      regionVisibilityFilter === true ? null : regionVisibilityFilter;

    map.setFilter(MAP_LAYERS.regionsFill, nextFilter);
    map.setFilter(MAP_LAYERS.regionsLine, nextFilter);

    if (
      !state.showPeripheralAreas &&
      state.zoomMode === "region" &&
      !state.lockedRegion &&
      hoveredRegionIdRef.current !== undefined &&
      map.getSource(MAP_SOURCES.regions)
    ) {
      map.setFeatureState(
        {
          source: MAP_SOURCES.regions,
          sourceLayer: SOURCE_LAYERS.regions,
          id: hoveredRegionIdRef.current,
        },
        { hover: false }
      );
      hoveredRegionIdRef.current = undefined;
      tooltipRef.current?.remove();
      map.getCanvas().style.cursor = "";
      dispatch({ type: "hoveredRegionChanged", region: null });
    }
  }, [dispatch, state.lockedRegion, state.showPeripheralAreas, state.zoomMode]);
}
