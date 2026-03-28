import {
  DA_METRICS_BY_ID,
  type DaMetricFormatId,
  type DaMetricId,
  type MetricPaletteId,
} from "../config/daMetrics";
import type { DaFeatureProperties } from "../types/data";
import { formatMetricValue, formatScore, toNumber } from "../utils/format";

export type DaComponentId = "exposure" | "sensitivity" | "adaptiveCapacity";

interface ComponentRowSpec {
  metricId: DaMetricId;
  label?: string;
}

interface ComponentSectionSpec {
  title: string;
  rows: readonly ComponentRowSpec[];
}

interface ComponentSpec {
  id: DaComponentId;
  title: string;
  shortTitle: string;
  scoreMetricId: DaMetricId;
  sections: readonly ComponentSectionSpec[];
}

export interface DaComponentDetailRow {
  metricId: DaMetricId;
  label: string;
  value: string;
  numericValue: number | null;
  format: DaMetricFormatId;
  barPercent: number;
  paletteId: MetricPaletteId;
}

export interface DaComponentDetailSection {
  title: string;
  rows: DaComponentDetailRow[];
}

export interface DaComponentDetailCard {
  id: DaComponentId;
  title: string;
  shortTitle: string;
  scoreValue: string;
  scoreNumericValue: number;
  compactPreviewPaletteId: MetricPaletteId;
  sections: DaComponentDetailSection[];
}

export interface DaHviSummaryDetail {
  scoreValue: string;
  formula: string;
  note: string;
}

export const DA_COMPONENT_DISPLAY_SCALING_NOTE =
  "Mini bars use observed data ranges for comparison only. Map colors and legends use clipped display ranges for stronger contrast.";

const COMPONENT_SPECS: readonly ComponentSpec[] = [
  {
    id: "exposure",
    title: "Exposure (E)",
    shortTitle: "E",
    scoreMetricId: "exposure_index",
    sections: [
      {
        title: "Primary inputs",
        rows: [
          { metricId: "exposure_mean" },
          { metricId: "hardscape_frac" },
        ],
      },
      {
        title: "Hardscape breakdown",
        rows: [
          { metricId: "frac_buildings" },
          { metricId: "frac_paved" },
          { metricId: "frac_other_built" },
        ],
      },
    ],
  },
  {
    id: "sensitivity",
    title: "Sensitivity (S)",
    shortTitle: "S",
    scoreMetricId: "sensitivity_index",
    sections: [
      {
        title: "Equal contributors",
        rows: [
          { metricId: "unemployment_rate" },
          { metricId: "low_income_rate" },
          { metricId: "pct_seniors_65plus" },
          { metricId: "pct_living_alone" },
        ],
      },
    ],
  },
  {
    id: "adaptiveCapacity",
    title: "Adaptive Capacity (A)",
    shortTitle: "A",
    scoreMetricId: "adaptive_capacity_index",
    sections: [
      {
        title: "Primary inputs",
        rows: [
          { metricId: "green_frac" },
          { metricId: "pct_renter" },
          { metricId: "pct_major_repairs" },
          { metricId: "pct_core_need" },
        ],
      },
      {
        title: "Green-cover breakdown",
        rows: [
          { metricId: "frac_coniferous" },
          { metricId: "frac_deciduous" },
          { metricId: "frac_shrub" },
        ],
      },
    ],
  },
] as const;

function toBarPercent(metricId: DaMetricId, value: unknown): number {
  const numeric = toNumber(value);
  const metric = DA_METRICS_BY_ID[metricId];
  const span = metric.domainMax - metric.domainMin;
  if (numeric === null || !Number.isFinite(span) || span <= 0) return 0;
  const normalized = (numeric - metric.domainMin) / span;
  return Math.max(0, Math.min(1, normalized));
}

export function getDaHviSummaryDetail(da: DaFeatureProperties): DaHviSummaryDetail {
  return {
    scoreValue: formatScore(da.hvi_index_n01),
    formula: "HVI = (E + S + (1 - A)) / 3",
    note: "Higher Exposure and Sensitivity raise HVI, while higher Adaptive Capacity lowers it.",
  };
}

export function getDaComponentDetailCards(
  da: DaFeatureProperties
): DaComponentDetailCard[] {
  return COMPONENT_SPECS.map((component) => {
    const scoreMetric = DA_METRICS_BY_ID[component.scoreMetricId];

    return {
      id: component.id,
      title: component.title,
      shortTitle: component.shortTitle,
      scoreValue: formatMetricValue(scoreMetric, da[scoreMetric.propertyKey]),
      scoreNumericValue: Math.max(0, Math.min(1, toNumber(da[scoreMetric.propertyKey]) ?? 0)),
      compactPreviewPaletteId: scoreMetric.paletteId,
      sections: component.sections.map((section) => ({
        title: section.title,
        rows: section.rows.map((row) => {
          const metric = DA_METRICS_BY_ID[row.metricId];
          const rawValue = da[metric.propertyKey];

          return {
            metricId: row.metricId,
            label: row.label ?? metric.label,
            value: formatMetricValue(metric, rawValue),
            numericValue: toNumber(rawValue),
            format: metric.format,
            barPercent: toBarPercent(row.metricId, rawValue),
            paletteId: metric.paletteId,
          };
        }),
      })),
    };
  });
}
