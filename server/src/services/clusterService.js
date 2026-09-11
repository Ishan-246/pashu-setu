// Orchestration: cases -> ST-DBSCAN -> risk fusion -> prioritised queue.
// This is the only place that knows the order of operations.

import { stDbscan } from "../lib/stdbscan.js";
import { fuse } from "../lib/riskFusion.js";
import { lookupRisk, RISK_DISCLAIMER } from "../data/riskContext.js";
import { CLUSTER_PARAMS, PARAM_NOTE } from "../config.js";
import { clusterKeyFor, getAction } from "../store/actionStore.js";

export function analyse(cases, overrides = {}) {
  const params = { ...CLUSTER_PARAMS, ...overrides };
  const { clusters, noise } = stDbscan(cases, params);

  const assessed = clusters.map((members, i) => {
    const fused = fuse(members, lookupRisk);
    const clusterKey = clusterKeyFor(members, members[0].syndrome);
    return {
      clusterId: `CL-${String(i + 1).padStart(3, "0")}`,
      clusterKey,
      syndrome: members[0].syndrome,
      caseIds: members.map((c) => c.id),
      cases: members,
      ...fused,
      action: getAction(clusterKey),
    };
  });

  // Highest priority first — this ordering IS the vet queue.
  assessed.sort((a, b) => b.priorityScore - a.priorityScore);

  return {
    params,
    paramNote: PARAM_NOTE,
    riskDisclaimer: RISK_DISCLAIMER,
    totalCases: cases.length,
    clusters: assessed,
    isolatedCases: noise.map((c) => ({
      id: c.id,
      village: c.village,
      syndrome: c.syndrome,
      severityLevel: c.severityLevel,
      timestamp: c.timestamp,
      lat: c.lat,
      lng: c.lng,
      note: "Isolated report — monitor, no cluster",
    })),
  };
}
