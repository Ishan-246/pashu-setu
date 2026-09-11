// All tunable prototype parameters live here, in one place.
// A judge WILL ask "why 5 km?" — the honest answer is in PARAM_NOTE below.

export const CLUSTER_PARAMS = {
  epsSpatialKm: 5,      // max distance between two related cases
  epsTemporalHours: 48, // max time gap between two related cases
  minPts: 3,            // min cases (including itself) to form a cluster core
};

export const FUSION_WEIGHTS = {
  clusterStrength: 0.4,
  severity: 0.3,
  riskContext: 0.3,
};

export const PRIORITY_BANDS = [
  { max: 30, label: "LOW" },
  { max: 60, label: "MEDIUM" },
  { max: 80, label: "HIGH" },
  { max: Infinity, label: "CRITICAL" },
];

export const PARAM_NOTE =
  "Prototype parameters, not validated epidemiological thresholds. " +
  "In production these would be calibrated per disease, species, geography " +
  "and historical surveillance data.";
