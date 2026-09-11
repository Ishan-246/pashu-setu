// Risk fusion — combine LIVE FIELD EVIDENCE with EXISTING RISK CONTEXT
// into one explainable priority score.
//
// Deliberately not machine learning. Every number below can be traced back
// to a stated input, which is what makes it defensible in a Q&A.

import { distanceKm, hoursBetween } from "./haversine.js";
import { FUSION_WEIGHTS, PRIORITY_BANDS } from "../config.js";

const SEVERITY_POINTS = { LOW: 30, MEDIUM: 60, HIGH: 90 };
const RISK_POINTS = { LOW: 25, MODERATE: 55, HIGH: 85 };

// How strong is the field signal itself? Size + spread + tempo.
export function clusterStrength(cases) {
  const caseCount = cases.length;
  const villages = new Set(cases.map((c) => c.village));

  const times = cases.map((c) => new Date(c.timestamp).getTime());
  const windowHours = (Math.max(...times) - Math.min(...times)) / 3600000;

  // size: how many linked cases. 10+ saturates. Dominant component.
  const sizeScore = Math.min(caseCount / 10, 1) * 60;
  // spread: cases in 3+ villages saturates it. Spread is worse than depth.
  const spreadScore = Math.min((villages.size - 1) / 2, 1) * 25;
  // tempo: cases per 24h. 8+/day saturates it. Deliberately the smallest
  // component — a burst of 3 in one hour should not outrank a real spread.
  const perDay = caseCount / Math.max(windowHours / 24, 0.25);
  const tempoScore = Math.min(perDay / 8, 1) * 15;

  return {
    score: Math.round(sizeScore + spreadScore + tempoScore),
    caseCount,
    villageCount: villages.size,
    windowHours: Math.round(windowHours),
    villages: [...villages],
  };
}

export function meanSeverity(cases) {
  const total = cases.reduce(
    (sum, c) => sum + (SEVERITY_POINTS[c.severityLevel] ?? 30),
    0
  );
  return Math.round(total / cases.length);
}

// Worst risk level across the villages involved. lookupRisk is injected so
// the real NADRES feed can replace the mock without touching this file.
export function contextRisk(cases, lookupRisk) {
  let worst = { level: "LOW", points: RISK_POINTS.LOW, village: null, source: null };
  for (const c of cases) {
    const entry = lookupRisk(c.village);
    if (!entry) continue;
    const points = RISK_POINTS[entry.riskLevel] ?? RISK_POINTS.LOW;
    if (points > worst.points) {
      worst = { level: entry.riskLevel, points, village: c.village, source: entry.source };
    }
  }
  return worst;
}

function bandFor(score) {
  return PRIORITY_BANDS.find((b) => score <= b.max).label;
}

// Geometric centre and radius, for the map circle.
export function clusterGeometry(cases) {
  const centre = {
    lat: cases.reduce((s, c) => s + c.lat, 0) / cases.length,
    lng: cases.reduce((s, c) => s + c.lng, 0) / cases.length,
  };
  const radiusKm = Math.max(...cases.map((c) => distanceKm(centre, c)));
  return { centre, radiusKm: Number(radiusKm.toFixed(2)) };
}

export function fuse(cases, lookupRisk) {
  const strength = clusterStrength(cases);
  const severity = meanSeverity(cases);
  const risk = contextRisk(cases, lookupRisk);

  const priorityScore = Math.round(
    strength.score * FUSION_WEIGHTS.clusterStrength +
      severity * FUSION_WEIGHTS.severity +
      risk.points * FUSION_WEIGHTS.riskContext
  );

  return {
    priorityScore,
    priorityLabel: bandFor(priorityScore),
    breakdown: {
      clusterStrength: strength.score,
      severity,
      riskContext: risk.points,
      weights: FUSION_WEIGHTS,
    },
    signal: strength,
    risk,
    geometry: clusterGeometry(cases),
    // The line that must survive into every screen and every answer:
    status: "SUSPECTED HEALTH EVENT — veterinary verification required",
    isDiagnosis: false,
  };
}

export { hoursBetween };
