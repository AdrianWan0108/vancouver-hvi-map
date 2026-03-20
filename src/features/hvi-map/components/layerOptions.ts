import {
  DA_METRICS_BY_ID,
  type DaMetricId,
  type DaMetricConfig,
} from "../config/daMetrics";

export interface LayerMetricGroup {
  label: string;
  metrics: DaMetricConfig[];
}

const LAYER_GROUP_ORDER: ReadonlyArray<{
  label: string;
  metricIds: readonly DaMetricId[];
}> = [
  {
    label: "HVI",
    metricIds: ["hvi_index_n01"],
  },
  {
    label: "Exposure (E)",
    metricIds: [
      "exposure_index",
      "exposure_mean",
      "hardscape_frac",
      "frac_buildings",
      "frac_paved",
      "frac_other_built",
    ],
  },
  {
    label: "Sensitivity (S)",
    metricIds: [
      "sensitivity_index",
      "unemployment_rate",
      "low_income_rate",
      "pct_seniors_65plus",
      "pct_living_alone",
    ],
  },
  {
    label: "Adaptive Capacity (A)",
    metricIds: [
      "adaptive_capacity_index",
      "green_frac",
      "pct_renter",
      "pct_major_repairs",
      "pct_core_need",
      "frac_coniferous",
      "frac_deciduous",
      "frac_shrub",
    ],
  },
  {
    label: "Context",
    metricIds: ["pop_total"],
  },
] as const;

export function getLayerMetricGroups(): LayerMetricGroup[] {
  const seenMetricIds = new Set<DaMetricId>();
  const groups = LAYER_GROUP_ORDER.map((group) => ({
    label: group.label,
    metrics: group.metricIds.map((metricId) => {
      seenMetricIds.add(metricId);
      return DA_METRICS_BY_ID[metricId];
    }),
  }));

  const remainingMetrics = Object.values(DA_METRICS_BY_ID).filter(
    (metric) => !seenMetricIds.has(metric.id)
  );
  if (remainingMetrics.length > 0) {
    groups.push({
      label: "Other",
      metrics: remainingMetrics,
    });
  }

  return groups;
}
