import { DA_METRICS_BY_ID, type DaMetricId } from "../config/daMetrics";
import type { DaFeatureProperties } from "../types/data";
import {
  formatInteger,
  formatMetricValue,
  formatScore,
  formatPercent1,
} from "../utils/format";

interface DaDetailsSectionProps {
  da: DaFeatureProperties;
  selectedMetric: DaMetricId;
}

function ValueRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <b>{label}:</b> {value}
    </div>
  );
}

export default function DaDetailsSection({
  da,
  selectedMetric,
}: DaDetailsSectionProps) {
  const primaryMetric = DA_METRICS_BY_ID[selectedMetric];

  return (
    <div style={{ display: "grid", gap: 10 }}>
      <div>
        <div style={{ fontWeight: 700, marginBottom: 4 }}>Selected Layer</div>
        <ValueRow
          label={primaryMetric.label}
          value={formatMetricValue(primaryMetric, da[primaryMetric.propertyKey])}
        />
      </div>

      <div>
        <div style={{ fontWeight: 700, marginBottom: 4 }}>HVI</div>
        <ValueRow label="HVI (0-1)" value={formatScore(da.hvi_index_n01)} />
        <ValueRow label="Sensitivity" value={formatScore(da.sensitivity_index)} />
        <ValueRow
          label="Adaptive Capacity"
          value={formatScore(da.adaptive_capacity_index)}
        />
        <ValueRow label="Exposure Index" value={formatScore(da.exposure_index)} />
      </div>

      <div>
        <div style={{ fontWeight: 700, marginBottom: 4 }}>Key stats</div>
        <ValueRow label="Population" value={formatInteger(da.pop_total)} />
        <ValueRow
          label="Unemployment rate"
          value={formatPercent1(da.unemployment_rate)}
        />
        <ValueRow label="Low income rate" value={formatPercent1(da.low_income_rate)} />
        <ValueRow
          label="% Seniors 65+"
          value={formatPercent1(da.pct_seniors_65plus)}
        />
        <ValueRow
          label="% Living alone"
          value={formatPercent1(da.pct_living_alone)}
        />
      </div>

      <div>
        <div style={{ fontWeight: 700, marginBottom: 4 }}>Greenness</div>
        <ValueRow label="Green fraction" value={formatScore(da.green_frac)} />
        <ValueRow label="Coniferous" value={formatScore(da.frac_coniferous)} />
        <ValueRow label="Deciduous" value={formatScore(da.frac_deciduous)} />
        <ValueRow label="Shrub" value={formatScore(da.frac_shrub)} />
        <ValueRow label="Modified herb" value={formatScore(da.frac_modified_herb)} />
        <ValueRow label="Natural herb" value={formatScore(da.frac_natural_herb)} />
      </div>
    </div>
  );
}
