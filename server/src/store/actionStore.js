// Vet verification -> lab -> government response workflow state.
//
// All simulated dashboard statuses. No scheduling, no notifications, no lab
// system, no government API. Buttons move a status field; that is the point.
//
// Keyed by clusterKey (syndrome + earliest case), NOT the display id, so a
// cluster keeps its status when new cases join it mid-demo.

import { driver } from "../storage/index.js";

export function clusterKeyFor(cases, syndrome) {
  const earliest = [...cases].sort((a, b) =>
    a.timestamp.localeCompare(b.timestamp)
  )[0];
  return `${syndrome}::${earliest.id}`;
}

function defaults(clusterKey) {
  return {
    clusterKey,
    verificationStatus: "PENDING",
    assignedTo: null,
    labRequired: false,
    labStatus: "NOT_REQUIRED",
    labResult: null,
    responseStatus: "NONE",
    responseNote: null,
    updatedAt: null,
  };
}

export function getAction(clusterKey) {
  return driver.getActionRow(clusterKey) ?? defaults(clusterKey);
}

// Partial update — only the fields you pass are changed.
export function updateAction(clusterKey, patch) {
  const current = getAction(clusterKey);
  const next = {
    ...current,
    ...patch,
    clusterKey,
    labRequired:
      patch.labRequired === undefined ? current.labRequired : !!patch.labRequired,
    updatedAt: new Date().toISOString(),
  };
  return driver.upsertActionRow(next);
}

// The legal transitions, so the UI and the API agree.
export const WORKFLOW = {
  verification: ["PENDING", "UNDER_VERIFICATION", "VERIFIED", "REJECTED"],
  lab: ["NOT_REQUIRED", "SAMPLE_COLLECTED", "IN_TESTING", "RESULT_READY"],
  labResult: ["CONFIRMED", "RULED_OUT", "INCONCLUSIVE"],
  response: ["NONE", "RESPONSE_INITIATED", "VACCINATION_LOGGED", "CONTAINMENT_LOGGED", "CLOSED"],
};
