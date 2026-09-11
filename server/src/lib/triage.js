// Triage: turn reported symptoms into a SYNDROME and a SEVERITY.
//
// A syndrome is a broad clinical pattern, NOT a diagnosis. We never name a
// disease here. The vet verifies; the laboratory confirms.

export const SYNDROMES = {
  ORAL_VESICULAR: "Febrile / oral-vesicular syndrome",
  RESPIRATORY: "Febrile / respiratory syndrome",
  NODULAR_SKIN: "Febrile / nodular-skin syndrome",
  NEURO: "Neurological syndrome",
  REPRODUCTIVE: "Reproductive / abortion syndrome",
  SUDDEN_DEATH: "Sudden death",
  UNDIFFERENTIATED: "Undifferentiated febrile syndrome",
};

// Each rule: if enough of `requires` are present, the syndrome applies.
const SYNDROME_RULES = [
  { syndrome: SYNDROMES.SUDDEN_DEATH, requires: ["sudden_death"], minMatches: 1 },
  { syndrome: SYNDROMES.ORAL_VESICULAR, requires: ["fever", "mouth_lesions", "drooling", "lameness", "reduced_milk"], minMatches: 2 },
  { syndrome: SYNDROMES.NODULAR_SKIN, requires: ["skin_nodules", "fever", "swelling", "reduced_milk"], minMatches: 2 },
  { syndrome: SYNDROMES.RESPIRATORY, requires: ["fever", "nasal_discharge", "coughing", "breathing_difficulty"], minMatches: 2 },
  { syndrome: SYNDROMES.NEURO, requires: ["circling", "convulsions", "unable_to_stand"], minMatches: 1 },
  { syndrome: SYNDROMES.REPRODUCTIVE, requires: ["abortion", "retained_placenta", "infertility"], minMatches: 1 },
];

// Severity weight per symptom. Higher = more urgent.
const SEVERITY_WEIGHTS = {
  sudden_death: 40,
  unable_to_stand: 25,
  convulsions: 25,
  breathing_difficulty: 20,
  abortion: 20,
  bleeding: 20,
  mouth_lesions: 12,
  skin_nodules: 14,
  swelling: 12,
  circling: 15,
  fever: 10,
  drooling: 8,
  lameness: 8,
  nasal_discharge: 8,
  coughing: 8,
  reduced_milk: 6,
  reduced_appetite: 5,
  retained_placenta: 10,
  infertility: 5,
};

export function mapSyndrome(symptoms) {
  for (const rule of SYNDROME_RULES) {
    const matches = rule.requires.filter((s) => symptoms.includes(s)).length;
    if (matches >= rule.minMatches) return rule.syndrome;
  }
  return SYNDROMES.UNDIFFERENTIATED;
}

// Returns { score (0-100), level: LOW | MEDIUM | HIGH }
export function scoreSeverity(symptoms, animalsAffected = 1) {
  const symptomScore = symptoms.reduce(
    (total, s) => total + (SEVERITY_WEIGHTS[s] ?? 5),
    0
  );
  // More animals in one report is itself a signal.
  const countBonus = Math.min((animalsAffected - 1) * 8, 24);
  const score = Math.min(symptomScore + countBonus, 100);

  let level = "LOW";
  if (score >= 60) level = "HIGH";
  else if (score >= 30) level = "MEDIUM";

  return { score, level };
}

// Single entry point the report form will call later.
export function triage({ symptoms, animalsAffected = 1 }) {
  const syndrome = mapSyndrome(symptoms);
  const severity = scoreSeverity(symptoms, animalsAffected);
  return {
    syndrome,
    severityScore: severity.score,
    severityLevel: severity.level,
    isDiagnosis: false, // stays false everywhere, by design
  };
}
