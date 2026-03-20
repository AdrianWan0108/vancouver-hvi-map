export type ZoomMode = "region" | "da";

export interface FeatureProperties {
  [key: string]: unknown;
}

export interface DaFeatureProperties extends FeatureProperties {
  DGUID: string;
  DAUID: string;
  adaptive_capacity_index?: number;
  exposure_index?: number;
  exposure_mean?: number;
  frac_buildings?: number;
  frac_coniferous?: number;
  frac_deciduous?: number;
  frac_other_built?: number;
  frac_paved?: number;
  frac_shrub?: number;
  green_frac?: number;
  hardscape_frac?: number;
  has_adaptive?: boolean;
  has_exposure?: boolean;
  has_sensitivity?: boolean;
  hvi_complete?: boolean;
  hvi_index_n01?: number;
  hvi_raw?: number;
  living_alone_count?: number;
  low_income_rate?: number;
  low_income_rate_n01?: number;
  pct_core_need?: number;
  pct_living_alone?: number;
  pct_living_alone_n01?: number;
  pct_major_repairs?: number;
  pct_renter?: number;
  pct_seniors_65plus?: number;
  pct_seniors_65plus_n01?: number;
  pop_total?: number;
  seniors_65plus_count?: number;
  sensitivity_index?: number;
  unemployment_rate?: number;
  unemployment_rate_n01?: number;
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
