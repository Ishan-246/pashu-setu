// SIMULATED NADRES RISK CONTEXT — DEMO DATA.
//
// This stands in for the district-level disease-risk forewarning that
// ICAR-NIVEDI's NADRES publishes. We are NOT connected to any government
// system. The shape of this table is the integration boundary: swap this
// file for a real feed later and nothing else changes.
const RISK_TABLE = {
  "Village A": { riskLevel: "HIGH", source: "SIMULATED NADRES risk layer" },
  "Village B": { riskLevel: "HIGH", source: "SIMULATED NADRES risk layer" },
  "Village C": { riskLevel: "MODERATE", source: "SIMULATED NADRES risk layer" },
  "Village D": { riskLevel: "LOW", source: "SIMULATED NADRES risk layer" },
  "Village E": { riskLevel: "LOW", source: "SIMULATED NADRES risk layer" },
};

export function lookupRisk(village) {
  return RISK_TABLE[village] ?? null;
}

export const RISK_DISCLAIMER =
  "Risk context is SIMULATED DEMO DATA representing a NADRES-style feed. " +
  "Production use would require authorised access to the government system.";
