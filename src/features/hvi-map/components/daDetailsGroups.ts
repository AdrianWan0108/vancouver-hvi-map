import type { DaFeatureProperties } from "../types/data";
import {
  formatInteger,
  formatNumber2,
  formatPercent1,
  formatScore,
} from "../utils/format";

interface DaDetailsRow {
  label: string;
  value: string;
}

export interface DaDetailsGroup {
  title: string;
  rows: DaDetailsRow[];
  collapsible: boolean;
  defaultExpanded: boolean;
}

type DaDetailsFormatter = (da: DaFeatureProperties) => string;

interface DaDetailsRowSpec {
  label: string;
  format: DaDetailsFormatter;
}

interface DaDetailsGroupSpec {
  title: string;
  collapsible: boolean;
  defaultExpanded: boolean;
  rows: readonly DaDetailsRowSpec[];
}

const DA_DETAILS_GROUP_SPECS: readonly DaDetailsGroupSpec[] = [
  {
    title: "HVI Summary",
    collapsible: false,
    defaultExpanded: true,
    rows: [
      { label: "HVI (0-1)", format: (da) => formatScore(da.hvi_index_n01) },
      { label: "Sensitivity", format: (da) => formatScore(da.sensitivity_index) },
      {
        label: "Adaptive Capacity",
        format: (da) => formatScore(da.adaptive_capacity_index),
      },
      {
        label: "Exposure Index",
        format: (da) => formatScore(da.exposure_index),
      },
      {
        label: "Exposure Mean (deg C)",
        format: (da) => formatNumber2(da.exposure_mean),
      },
    ],
  },
  {
    title: "Social & Housing",
    collapsible: true,
    defaultExpanded: false,
    rows: [
      { label: "Population", format: (da) => formatInteger(da.pop_total) },
      {
        label: "Unemployment Rate",
        format: (da) => formatPercent1(da.unemployment_rate),
      },
      {
        label: "Low Income Rate",
        format: (da) => formatPercent1(da.low_income_rate),
      },
      {
        label: "% Seniors 65+",
        format: (da) => formatPercent1(da.pct_seniors_65plus),
      },
      {
        label: "% Living Alone",
        format: (da) => formatPercent1(da.pct_living_alone),
      },
      { label: "% Renters", format: (da) => formatPercent1(da.pct_renter) },
      {
        label: "% Core Housing Need",
        format: (da) => formatPercent1(da.pct_core_need),
      },
      {
        label: "% Major Repairs",
        format: (da) => formatPercent1(da.pct_major_repairs),
      },
    ],
  },
  {
    title: "Land Cover & Built",
    collapsible: true,
    defaultExpanded: false,
    rows: [
      { label: "Green Fraction", format: (da) => formatScore(da.green_frac) },
      {
        label: "Coniferous",
        format: (da) => formatScore(da.frac_coniferous),
      },
      { label: "Deciduous", format: (da) => formatScore(da.frac_deciduous) },
      { label: "Shrub", format: (da) => formatScore(da.frac_shrub) },
      { label: "Buildings", format: (da) => formatScore(da.frac_buildings) },
      {
        label: "Other Built",
        format: (da) => formatScore(da.frac_other_built),
      },
      { label: "Paved", format: (da) => formatScore(da.frac_paved) },
      { label: "Hardscape", format: (da) => formatScore(da.hardscape_frac) },
    ],
  },
];

export function getDefaultDaDetailsExpandedState(): Record<string, boolean> {
  return Object.fromEntries(
    DA_DETAILS_GROUP_SPECS.map((group) => [group.title, group.defaultExpanded])
  );
}

export function getDaDetailsGroups(da: DaFeatureProperties): DaDetailsGroup[] {
  return DA_DETAILS_GROUP_SPECS.map((group) => ({
    title: group.title,
    collapsible: group.collapsible,
    defaultExpanded: group.defaultExpanded,
    rows: group.rows.map((row) => ({
      label: row.label,
      value: row.format(da),
    })),
  }));
}
