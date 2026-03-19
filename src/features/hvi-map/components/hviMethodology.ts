export interface HviMethodologySection {
  title: string;
  formula: string;
  summary: string;
  indicators: readonly string[];
}

export const HVI_METHOD_FINAL_FORMULA = "HVI = (E + S + (1 - A)) / 3";

export const HVI_METHOD_INTERPRETATION =
  "Higher E and S increase vulnerability, while higher A reduces vulnerability.";

export const HVI_METHODOLOGY_SECTIONS: readonly HviMethodologySection[] = [
  {
    title: "Exposure (E)",
    formula: "E = 0.67 * exposure_mean_n01 + 0.33 * hardscape_frac_n01",
    summary:
      "Combines normalized CANUE land surface temperature with normalized hardscape intensity.",
    indicators: [
      "CANUE land surface temperature",
      "Hardscape classes: 1 Buildings, 2 Paved, 3 Other Built",
    ],
  },
  {
    title: "Sensitivity (S)",
    formula:
      "S = mean(unemployment_rate_n01, low_income_rate_n01, pct_seniors_65plus_n01, pct_living_alone_n01)",
    summary: "Equal-weight average of four social vulnerability indicators.",
    indicators: [
      "Unemployment rate",
      "Low income rate",
      "Age 65+",
      "Living alone",
    ],
  },
  {
    title: "Adaptive Capacity (A)",
    formula:
      "A = mean(green_capacity_n01, renter_capacity_n01, major_repairs_capacity_n01, core_need_capacity_n01)",
    summary:
      "Equal-weight average of protective capacity indicators, including woody greenness and inverse housing stress measures.",
    indicators: [
      "Woody greenness: 6 Coniferous, 7 Deciduous, 8 Shrub",
      "Inverse % renter",
      "Inverse % major repairs needed",
      "Inverse % core housing need",
    ],
  },
] as const;

export const HVI_METHODOLOGY_NOTE =
  "This panel explains how the score is built. The current tiles do not expose every normalized subcomponent as a separate live field.";
