export type ZoomMode = "region" | "da";

export interface FeatureProperties {
  [key: string]: unknown;
}

export interface DaFeatureProperties extends FeatureProperties {
  DGUID: string;
  pop_total?: number;
  unemployment_rate?: number;
  low_income_rate?: number;
  seniors_65plus_count?: number;
  living_alone_count?: number;
  pct_seniors_65plus?: number;
  pct_living_alone?: number;
  unemployment_rate_n01?: number;
  low_income_rate_n01?: number;
  pct_seniors_65plus_n01?: number;
  pct_living_alone_n01?: number;
  sensitivity_index?: number;
  adaptive_capacity_index?: number;
  green_frac?: number;
  frac_coniferous?: number;
  frac_deciduous?: number;
  frac_shrub?: number;
  frac_modified_herb?: number;
  frac_natural_herb?: number;
  exposure_mean?: number;
  hvi_raw?: number;
  hvi_index_n01?: number;
  has_sensitivity?: boolean;
  has_adaptive?: boolean;
  has_exposure?: boolean;
  hvi_complete?: boolean;
  exposure_index?: number;
}

export interface RegionFeatureProperties extends FeatureProperties {
  FullName?: string;
  ShortName?: string;
  MunNum?: number;
  region_hvi_raw_pw?: number;
  region_pop_total?: number;
  da_count_used?: number;
  region_hvi_n01?: number;
}

export type FeatureId = string | number;
