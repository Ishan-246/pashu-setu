// The demo scenario. SIMULATED CASES — DEMO DATA.
//
// Story it tells, in order:
//   - one isolated report in Village A  -> no cluster
//   - more reports appear in A, B, C over ~35 hours, same syndrome
//   - 7 cases across 3 villages -> CLUSTER
//   - two decoys that must NOT join: a different syndrome far away,
//     and an old case in the same village outside the time window.
//
// The decoys matter. They are how you prove the algorithm discriminates
// instead of just grouping everything.

export const SAMPLE_REPORTS = [
  // --- the emerging event -------------------------------------------------
  { id: "C-1001", village: "Village A", species: "Cattle", animalsAffected: 1,
    symptoms: ["fever", "mouth_lesions", "reduced_milk"],
    timestamp: "2026-09-08T09:00:00+05:30" },

  { id: "C-1002", village: "Village A", species: "Cattle", animalsAffected: 2,
    symptoms: ["fever", "drooling", "mouth_lesions", "reduced_milk"],
    timestamp: "2026-09-08T14:30:00+05:30" },

  { id: "C-1003", village: "Village B", species: "Buffalo", animalsAffected: 1,
    symptoms: ["fever", "mouth_lesions", "lameness"],
    timestamp: "2026-09-08T18:00:00+05:30" },

  { id: "C-1004", village: "Village A", species: "Cattle", animalsAffected: 3,
    symptoms: ["fever", "mouth_lesions", "drooling", "unable_to_stand"],
    timestamp: "2026-09-09T08:00:00+05:30" },

  { id: "C-1005", village: "Village C", species: "Cattle", animalsAffected: 1,
    symptoms: ["fever", "reduced_milk", "lameness"],
    timestamp: "2026-09-09T11:00:00+05:30" },

  { id: "C-1006", village: "Village B", species: "Cattle", animalsAffected: 2,
    symptoms: ["fever", "mouth_lesions", "reduced_milk", "drooling"],
    timestamp: "2026-09-09T15:00:00+05:30" },

  { id: "C-1007", village: "Village C", species: "Buffalo", animalsAffected: 1,
    symptoms: ["fever", "drooling", "reduced_appetite"],
    timestamp: "2026-09-09T20:00:00+05:30" },

  // --- decoy 1: different syndrome, far away -> must stay NOISE ------------
  { id: "C-1008", village: "Village D", species: "Cattle", animalsAffected: 1,
    symptoms: ["fever", "coughing", "nasal_discharge"],
    timestamp: "2026-09-09T10:00:00+05:30" },

  // --- decoy 2: same village, same syndrome, but 3 days earlier -----------
  { id: "C-1009", village: "Village A", species: "Cattle", animalsAffected: 1,
    symptoms: ["fever", "reduced_milk"],
    timestamp: "2026-09-05T12:00:00+05:30" },
];

// Reports 1..n, for demoing "watch the cluster appear as cases arrive".
export function reportsUpTo(n) {
  return SAMPLE_REPORTS.slice(0, n);
}
