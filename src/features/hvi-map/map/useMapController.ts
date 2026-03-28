import { useCallback, useEffect, useRef, useState, type RefObject } from "react";
import maplibregl, { Map as MapLibreMap } from "maplibre-gl";
import type { MapGeoJSONFeature, MapLayerMouseEvent, MapMouseEvent } from "maplibre-gl";
import { PMTiles, Protocol } from "pmtiles";
import { DA_METRICS_BY_ID, DEFAULT_DA_METRIC_ID } from "../config/daMetrics";
import {
  METRO_VANCOUVER_DEFAULT_VIEW_BOUNDS,
  PERIPHERAL_REGION_MANUAL_EXCLUDE_KEYS,
  PERIPHERAL_REGION_MANUAL_INCLUDE_KEYS,
  PERIPHERAL_REGION_POPULATION_THRESHOLD,
  REGION_HVI_METRIC,
  ZOOM_DA,
} from "../config/regionConfig";
import type {
  DaFeatureProperties,
  FeatureId,
  RegionFeatureProperties,
} from "../types/data";
import type { SearchBounds, SearchResult } from "../types/search";
import { formatMetricValue, formatScore } from "../utils/format";
import { getRegionDisplayName } from "../utils/region";
import {
  DA_ZOOM_REGION_DIVIDER_CASING_STYLE,
  DA_ZOOM_REGION_DIVIDER_STYLE,
  buildDaPeripheralVisibilityFilterExpression,
  buildDaFillOpacityExpression,
  buildFillColorExpression,
  buildFilterExpression,
  buildLockedFeatureFilterExpression,
  buildLineOpacityExpression,
  combineFilterExpressions,
  buildLineWidthExpression,
  buildRegionVisibilityFilterExpression,
  LOCKED_DA_OUTLINE_STYLE,
} from "./expressions";
import { collapseCompactAttributionControl } from "./attribution";
import { getFirstPlaceLabelLayerId } from "./layerPlacement";
import { MAP_LAYERS, MAP_SOURCES, SOURCE_LAYERS } from "./layers";
import { getPmtilesUrls } from "./sources";
import { useMapDispatch } from "../state/useMapDispatch";
import { useMapUiState } from "../state/useMapUiState";
import {
  isPeripheralRegion,
  loadPeripheralAreaMetadata,
  type PeripheralAreaMetadata,
} from "../search/peripheralAreas";

interface TooltipContent {
  title?: string;
  label: string;
  value: string;
}

interface TooltipDom {
  wrapper: HTMLDivElement;
  titleEl: HTMLDivElement;
  labelEl: HTMLDivElement;
  valueEl: HTMLDivElement;
}

interface HoverEventPayload {
  feature: MapGeoJSONFeature;
  point: MapMouseEvent["point"];
  lngLat: MapMouseEvent["lngLat"];
}

const EMPTY_PERIPHERAL_DGUIDS: string[] = [];

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
  const dauid = properties.DAUID;
  if (dguid === null || dguid === undefined) return null;
  if (dauid === null || dauid === undefined) return null;
  return {
    ...properties,
    DGUID: String(dguid),
    DAUID: String(dauid),
  } as DaFeatureProperties;
}

function toRegionFeatureProperties(
  feature: MapGeoJSONFeature | undefined
): RegionFeatureProperties | null {
  if (!feature?.properties) return null;
  return feature.properties as RegionFeatureProperties;
}

function getRegionNameAtPoint(
  map: MapLibreMap,
  point: MapMouseEvent["point"]
): string | null {
  const features = map.queryRenderedFeatures(point, {
    layers: [MAP_LAYERS.regionsLookup],
  });
  const region = toRegionFeatureProperties(features[0]);
  return getRegionDisplayName(region);
}

function getTooltipMetricLabel(metricId: string, label: string): string {
  return metricId === DEFAULT_DA_METRIC_ID ? "HVI" : label;
}

function createPopupContentDom(): TooltipDom {
  const wrapper = document.createElement("div");
  wrapper.className = "map-tooltip";

  const titleEl = document.createElement("div");
  titleEl.className = "map-tooltip__title";
  titleEl.hidden = true;
  wrapper.appendChild(titleEl);
  const labelEl = document.createElement("div");
  labelEl.className = "map-tooltip__label";
  wrapper.appendChild(labelEl);
  const valueEl = document.createElement("div");
  valueEl.className = "map-tooltip__value";
  wrapper.appendChild(valueEl);

  return { wrapper, titleEl, labelEl, valueEl };
}

function updatePopupContentDom(
  dom: TooltipDom,
  { title, label, value }: TooltipContent
) {
  dom.titleEl.hidden = !title;
  dom.titleEl.textContent = title ?? "";
  dom.labelEl.textContent = label;
  dom.valueEl.textContent = value;
}

function toLngLatBounds(bounds: SearchBounds): [[number, number], [number, number]] {
  return [
    [bounds[0], bounds[1]],
    [bounds[2], bounds[3]],
  ];
}

function getInitialViewportPadding() {
  return { top: 72, right: 40, bottom: 40, left: 40 };
}

export function useMapController(containerRef: RefObject<HTMLDivElement | null>) {
  const state = useMapUiState();
  const dispatch = useMapDispatch();
  const [peripheralMetadata, setPeripheralMetadata] =
    useState<PeripheralAreaMetadata | null>(null);
  const peripheralDaDguids =
    peripheralMetadata?.peripheralDaDguids ?? EMPTY_PERIPHERAL_DGUIDS;

  const mapRef = useRef<MapLibreMap | null>(null);
  const tooltipRef = useRef<maplibregl.Popup | null>(null);
  const hoveredRegionIdRef = useRef<FeatureId | undefined>(undefined);
  const hoveredDaIdRef = useRef<FeatureId | undefined>(undefined);
  const stateRef = useRef(state);

  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  useEffect(() => {
    let cancelled = false;

    loadPeripheralAreaMetadata()
      .then((metadata) => {
        if (!cancelled) {
          setPeripheralMetadata(metadata);
        }
      })
      .catch((error) => {
        if (!cancelled) {
          console.warn("Unable to load peripheral area metadata.", error);
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const protocol = new Protocol();
    maplibregl.addProtocol("pmtiles", protocol.tile);

    const pmtilesUrls = getPmtilesUrls(import.meta.env.BASE_URL);
    const daPmtiles = new PMTiles(pmtilesUrls.da);
    const regionsPmtiles = new PMTiles(pmtilesUrls.regions);
    protocol.add(daPmtiles);
    protocol.add(regionsPmtiles);
    const initialBounds = toLngLatBounds(METRO_VANCOUVER_DEFAULT_VIEW_BOUNDS);
    const initialPadding = getInitialViewportPadding();

    const map = new maplibregl.Map({
      container: containerRef.current,
      style: "https://basemaps.cartocdn.com/gl/positron-gl-style/style.json",
      bounds: initialBounds,
      fitBoundsOptions: {
        padding: initialPadding,
        maxZoom: ZOOM_DA - 0.8,
        duration: 0,
      },
      attributionControl: false,
    });

    map.addControl(new maplibregl.NavigationControl(), "top-right");
    map.addControl(new maplibregl.AttributionControl({ compact: true }), "top-left");
    map.addControl(
      new maplibregl.ScaleControl({ maxWidth: 200, unit: "metric" }),
      "bottom-left"
    );
    const collapseAttribution = () => {
      const container = map.getContainer()
      collapseCompactAttributionControl(container)
    }

    const tooltip = new maplibregl.Popup({
      className: "map-tooltip-popup",
      closeButton: false,
      closeOnClick: false,
      offset: 10,
    });
    const tooltipDom = createPopupContentDom();
    tooltip.setDOMContent(tooltipDom.wrapper);
    const daRegionNameCache = new globalThis.Map<string, string | null>();
    let currentTooltipKey: string | null = null;
    let regionHoverRafId: number | null = null;
    let daHoverRafId: number | null = null;
    let hoverClearRafId: number | null = null;
    let pendingRegionHover: HoverEventPayload | null = null;
    let pendingDaHover: HoverEventPayload | null = null;
    let pendingHoverClearPoint: MapMouseEvent["point"] | null = null;

    mapRef.current = map;
    tooltipRef.current = tooltip;
    requestAnimationFrame(collapseAttribution);

    const hideTooltip = () => {
      currentTooltipKey = null;
      tooltip.remove();
      map.getCanvas().style.cursor = "";
    };

    const showTooltip = (
      contentKey: string,
      content: TooltipContent,
      lngLat: MapMouseEvent["lngLat"]
    ) => {
      if (currentTooltipKey !== contentKey) {
        updatePopupContentDom(tooltipDom, content);
        currentTooltipKey = contentKey;
      }

      tooltip.setLngLat(lngLat).addTo(map);
      map.getCanvas().style.cursor = "pointer";
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

    const clearHoveredRegionState = () => {
      pendingRegionHover = null;
      if (regionHoverRafId !== null) {
        window.cancelAnimationFrame(regionHoverRafId);
        regionHoverRafId = null;
      }
      clearRegionHover();
      hideTooltip();
      if (!stateRef.current.lockedRegion) {
        dispatch({ type: "hoveredRegionChanged", region: null });
      }
    };

    const clearHoveredDaState = () => {
      pendingDaHover = null;
      if (daHoverRafId !== null) {
        window.cancelAnimationFrame(daHoverRafId);
        daHoverRafId = null;
      }
      clearDaHover();
      hideTooltip();
      if (!stateRef.current.lockedDa) {
        dispatch({ type: "hoveredDaChanged", da: null, regionName: null });
      }
    };

    const handleRegionHover = ({ feature, lngLat }: HoverEventPayload) => {
      if (stateRef.current.zoomMode !== "region") return;

      const featureId = getFeatureId(feature);
      if (featureId === undefined) return;

      const properties = toRegionFeatureProperties(feature);
      if (!properties) return;

      const regionName = getRegionDisplayName(properties) ?? undefined;
      const score = formatScore(properties[REGION_HVI_METRIC.propertyKey]);

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

        if (!stateRef.current.lockedRegion) {
          dispatch({ type: "hoveredRegionChanged", region: properties });
        }
      }

      showTooltip(
        `region:${String(featureId)}`,
        {
          title: regionName,
          label: REGION_HVI_METRIC.label,
          value: score,
        },
        lngLat
      );
    };

    const handleDaHover = ({ feature, point, lngLat }: HoverEventPayload) => {
      if (stateRef.current.zoomMode !== "da") return;

      const featureId = getFeatureId(feature);
      if (featureId === undefined) return;

      const da = toDaFeatureProperties(feature);
      if (!da) return;

      const metric = DA_METRICS_BY_ID[stateRef.current.selectedMetric];
      const tooltipLabel = getTooltipMetricLabel(metric.id, metric.label);
      const tooltipValue = formatMetricValue(metric, da[metric.propertyKey]);

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

        let regionName = daRegionNameCache.get(da.DGUID);
        if (regionName === undefined) {
          regionName = getRegionNameAtPoint(map, point);
          daRegionNameCache.set(da.DGUID, regionName);
        }

        if (!stateRef.current.lockedDa) {
          dispatch({ type: "hoveredDaChanged", da, regionName });
        }
      }

      showTooltip(
        `da:${da.DGUID}:${metric.id}`,
        {
          label: tooltipLabel,
          value: tooltipValue,
        },
        lngLat
      );
    };

    const scheduleRegionHover = (payload: HoverEventPayload) => {
      pendingRegionHover = payload;
      if (regionHoverRafId !== null) return;

      regionHoverRafId = window.requestAnimationFrame(() => {
        regionHoverRafId = null;
        const nextPayload = pendingRegionHover;
        pendingRegionHover = null;
        if (!nextPayload) return;
        handleRegionHover(nextPayload);
      });
    };

    const scheduleDaHover = (payload: HoverEventPayload) => {
      pendingDaHover = payload;
      if (daHoverRafId !== null) return;

      daHoverRafId = window.requestAnimationFrame(() => {
        daHoverRafId = null;
        const nextPayload = pendingDaHover;
        pendingDaHover = null;
        if (!nextPayload) return;
        handleDaHover(nextPayload);
      });
    };

    const scheduleHoverClearCheck = (point: MapMouseEvent["point"]) => {
      pendingHoverClearPoint = point;
      if (hoverClearRafId !== null) return;

      hoverClearRafId = window.requestAnimationFrame(() => {
        hoverClearRafId = null;
        const nextPoint = pendingHoverClearPoint;
        pendingHoverClearPoint = null;
        if (!nextPoint) return;

        const currentState = stateRef.current;
        if (currentState.zoomMode === "region") {
          if (currentState.lockedRegion || hoveredRegionIdRef.current === undefined) {
            return;
          }

          const features = map.queryRenderedFeatures(nextPoint, {
            layers: [MAP_LAYERS.regionsFill],
          });

          if (features.length === 0) {
            clearHoveredRegionState();
          }
          return;
        }

        if (currentState.lockedDa || hoveredDaIdRef.current === undefined) return;

        const features = map.queryRenderedFeatures(nextPoint, {
          layers: [MAP_LAYERS.daFill],
        });
        if (features.length === 0) {
          clearHoveredDaState();
        }
      });
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
          PERIPHERAL_REGION_POPULATION_THRESHOLD,
          PERIPHERAL_REGION_MANUAL_INCLUDE_KEYS,
          PERIPHERAL_REGION_MANUAL_EXCLUDE_KEYS
        );
        const daPeripheralFilter = buildDaPeripheralVisibilityFilterExpression(
          stateRef.current.showPeripheralAreas,
          EMPTY_PERIPHERAL_DGUIDS
        );
        const regionFillColor = buildFillColorExpression(REGION_HVI_METRIC);
        const daFillColor = buildFillColorExpression(metric);
        const beforeLabelLayerId = getFirstPlaceLabelLayerId(map.getStyle().layers);

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
        }, beforeLabelLayerId);

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
        }, beforeLabelLayerId);

        map.addLayer({
          id: MAP_LAYERS.regionsLookup,
          type: "fill",
          source: MAP_SOURCES.regions,
          "source-layer": SOURCE_LAYERS.regions,
          minzoom: ZOOM_DA,
          paint: {
            "fill-opacity": 0,
            "fill-outline-color": "rgba(0,0,0,0)",
          },
        }, beforeLabelLayerId);

        map.addLayer({
          id: MAP_LAYERS.daFill,
          type: "fill",
          source: MAP_SOURCES.da,
          "source-layer": SOURCE_LAYERS.da,
          minzoom: ZOOM_DA,
          ...(daPeripheralFilter === true ? {} : { filter: daPeripheralFilter }),
          paint: {
            "fill-color": daFillColor,
            "fill-outline-color": daFillColor,
            "fill-opacity": buildDaFillOpacityExpression(metric, daFilterExpression),
          },
        }, beforeLabelLayerId);

        map.addLayer({
          id: MAP_LAYERS.daLine,
          type: "line",
          source: MAP_SOURCES.da,
          "source-layer": SOURCE_LAYERS.da,
          minzoom: ZOOM_DA,
          ...(daPeripheralFilter === true ? {} : { filter: daPeripheralFilter }),
          paint: {
            "line-color": LOCKED_DA_OUTLINE_STYLE.color,
            "line-width": buildLineWidthExpression(3, 0.6),
            "line-opacity": buildLineOpacityExpression(
              LOCKED_DA_OUTLINE_STYLE.opacity,
              0.2
            ),
          },
        }, beforeLabelLayerId);

        map.addLayer({
          id: MAP_LAYERS.regionsLineDaCasing,
          type: "line",
          source: MAP_SOURCES.regions,
          "source-layer": SOURCE_LAYERS.regions,
          minzoom: ZOOM_DA,
          ...(regionVisibilityFilter === true
            ? {}
            : { filter: regionVisibilityFilter }),
          layout: {
            "line-cap": "round",
            "line-join": "round",
          },
          paint: {
            "line-color": DA_ZOOM_REGION_DIVIDER_CASING_STYLE.color,
            "line-width": DA_ZOOM_REGION_DIVIDER_CASING_STYLE.width,
            "line-opacity": DA_ZOOM_REGION_DIVIDER_CASING_STYLE.opacity,
          },
        }, beforeLabelLayerId);

        map.addLayer({
          id: MAP_LAYERS.regionsLineDa,
          type: "line",
          source: MAP_SOURCES.regions,
          "source-layer": SOURCE_LAYERS.regions,
          minzoom: ZOOM_DA,
          ...(regionVisibilityFilter === true
            ? {}
            : { filter: regionVisibilityFilter }),
          layout: {
            "line-cap": "round",
            "line-join": "round",
          },
          paint: {
            "line-color": DA_ZOOM_REGION_DIVIDER_STYLE.color,
            "line-width": DA_ZOOM_REGION_DIVIDER_STYLE.width,
            "line-opacity": DA_ZOOM_REGION_DIVIDER_STYLE.opacity,
          },
        }, beforeLabelLayerId);

        map.addLayer({
          id: MAP_LAYERS.daLockedLine,
          type: "line",
          source: MAP_SOURCES.da,
          "source-layer": SOURCE_LAYERS.da,
          minzoom: ZOOM_DA,
          filter: combineFilterExpressions(
            daPeripheralFilter,
            buildLockedFeatureFilterExpression(
              "DGUID",
              stateRef.current.lockedDa?.DGUID ?? null
            )
          ),
          layout: {
            "line-cap": "round",
            "line-join": "round",
          },
          paint: {
            "line-color": LOCKED_DA_OUTLINE_STYLE.color,
            "line-width": LOCKED_DA_OUTLINE_STYLE.width,
            "line-opacity": LOCKED_DA_OUTLINE_STYLE.opacity,
          },
        }, beforeLabelLayerId);
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : "Unable to initialize map sources and layers.";
        console.error("Failed to initialize map layers:", error);
        dispatch({ type: "mapErrorChanged", message });
      }

      updateZoomMode();
      collapseAttribution();

      map.on("zoom", updateZoomMode);
      map.on("resize", collapseAttribution);

      map.on("mousemove", MAP_LAYERS.regionsFill, (event: MapLayerMouseEvent) => {
        const feature = event.features?.[0];
        if (!feature) return;
        scheduleRegionHover({
          feature,
          point: event.point,
          lngLat: event.lngLat,
        });
      });

      map.on("mouseleave", MAP_LAYERS.regionsFill, () => {
        clearHoveredRegionState();
      });

      map.on("mousemove", MAP_LAYERS.daFill, (event: MapLayerMouseEvent) => {
        const feature = event.features?.[0];
        if (!feature) return;
        scheduleDaHover({
          feature,
          point: event.point,
          lngLat: event.lngLat,
        });
      });

      map.on("mouseleave", MAP_LAYERS.daFill, () => {
        clearHoveredDaState();
      });

      map.on("mousemove", (event: MapMouseEvent) => {
        if (
          hoveredRegionIdRef.current === undefined &&
          hoveredDaIdRef.current === undefined
        ) {
          return;
        }
        scheduleHoverClearCheck(event.point);
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
        const regionName = getRegionNameAtPoint(map, event.point);

        dispatch({ type: "daClicked", da, regionName });
      });
    });

    return () => {
      if (regionHoverRafId !== null) {
        window.cancelAnimationFrame(regionHoverRafId);
      }
      if (daHoverRafId !== null) {
        window.cancelAnimationFrame(daHoverRafId);
      }
      if (hoverClearRafId !== null) {
        window.cancelAnimationFrame(hoverClearRafId);
      }
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
    if (!map.getLayer(MAP_LAYERS.daLockedLine)) return;

    const daPeripheralFilter = buildDaPeripheralVisibilityFilterExpression(
      state.showPeripheralAreas,
      peripheralDaDguids
    );

    map.setFilter(
      MAP_LAYERS.daLockedLine,
      combineFilterExpressions(
        daPeripheralFilter,
        buildLockedFeatureFilterExpression("DGUID", state.lockedDa?.DGUID ?? null)
      )
    );
  }, [peripheralDaDguids, state.lockedDa, state.showPeripheralAreas]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    if (!map.getLayer(MAP_LAYERS.regionsFill)) return;

    const regionVisibilityFilter = buildRegionVisibilityFilterExpression(
      state.showPeripheralAreas,
      PERIPHERAL_REGION_POPULATION_THRESHOLD,
      PERIPHERAL_REGION_MANUAL_INCLUDE_KEYS,
      PERIPHERAL_REGION_MANUAL_EXCLUDE_KEYS
    );
    const nextRegionFilter =
      regionVisibilityFilter === true ? null : regionVisibilityFilter;
    const daPeripheralFilter = buildDaPeripheralVisibilityFilterExpression(
      state.showPeripheralAreas,
      peripheralDaDguids
    );
    const nextDaFilter = daPeripheralFilter === true ? null : daPeripheralFilter;

    map.setFilter(MAP_LAYERS.regionsFill, nextRegionFilter);
    map.setFilter(MAP_LAYERS.regionsLine, nextRegionFilter);
    if (map.getLayer(MAP_LAYERS.regionsLineDaCasing)) {
      map.setFilter(MAP_LAYERS.regionsLineDaCasing, nextRegionFilter);
    }
    if (map.getLayer(MAP_LAYERS.regionsLineDa)) {
      map.setFilter(MAP_LAYERS.regionsLineDa, nextRegionFilter);
    }
    if (map.getLayer(MAP_LAYERS.daFill)) {
      map.setFilter(MAP_LAYERS.daFill, nextDaFilter);
    }
    if (map.getLayer(MAP_LAYERS.daLine)) {
      map.setFilter(MAP_LAYERS.daLine, nextDaFilter);
    }

    const hideTooltip = () => {
      tooltipRef.current?.remove();
      map.getCanvas().style.cursor = "";
    };

    if (
      !state.showPeripheralAreas &&
      state.lockedRegion &&
      isPeripheralRegion(state.lockedRegion)
    ) {
      dispatch({ type: "unlockRegion" });
      hideTooltip();
    }

    if (
      !state.showPeripheralAreas &&
      state.lockedDa &&
      peripheralDaDguids.includes(state.lockedDa.DGUID)
    ) {
      dispatch({ type: "unlockDa" });
      hideTooltip();
    }

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
      hideTooltip();
      dispatch({ type: "hoveredRegionChanged", region: null });
    }

    if (
      !state.showPeripheralAreas &&
      state.zoomMode === "da" &&
      !state.lockedDa &&
      hoveredDaIdRef.current !== undefined &&
      map.getSource(MAP_SOURCES.da)
    ) {
      map.setFeatureState(
        {
          source: MAP_SOURCES.da,
          sourceLayer: SOURCE_LAYERS.da,
          id: hoveredDaIdRef.current,
        },
        { hover: false }
      );
      hoveredDaIdRef.current = undefined;
      hideTooltip();
      dispatch({ type: "hoveredDaChanged", da: null, regionName: null });
    }
  }, [
    dispatch,
    peripheralDaDguids,
    state.lockedDa,
    state.lockedRegion,
    state.showPeripheralAreas,
    state.zoomMode,
  ]);

  const focusSearchResult = useCallback((entry: SearchResult) => {
    const map = mapRef.current;
    if (!map) return;

    tooltipRef.current?.remove();
    map.getCanvas().style.cursor = "";

    if (entry.kind === "address") {
      map.flyTo({ center: entry.center, zoom: 15, essential: true });
      return;
    }

    const padding = { top: 72, right: 40, bottom: 40, left: 40 };
    const bounds = toLngLatBounds(entry.bbox);
    const isCollapsedBounds =
      entry.bbox[0] === entry.bbox[2] || entry.bbox[1] === entry.bbox[3];

    if (entry.kind === "region") {
      if (isCollapsedBounds) {
        map.flyTo({ center: entry.center, zoom: 9.5, essential: true });
        return;
      }

      map.fitBounds(bounds, {
        padding,
        maxZoom: ZOOM_DA - 0.3,
        duration: 700,
        essential: true,
      });
      return;
    }

    if (isCollapsedBounds) {
      map.flyTo({ center: entry.center, zoom: ZOOM_DA + 1.5, essential: true });
      return;
    }

    map.fitBounds(bounds, {
      padding,
      maxZoom: 14,
      duration: 700,
      essential: true,
    });
  }, []);

  return { focusSearchResult };
}
