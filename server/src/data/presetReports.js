// Predefined farmer reports for the demo, as they would arrive from the
// helpline already transcribed. These are INPUTS — each becomes a Case only
// after it is submitted.
//
// Three shapes so the demo can show the system discriminating, not just
// grouping: an oral/vesicular pattern, a nodular-skin pattern, and a
// reproductive pattern.

export const PRESET_REPORTS = [
  {
    key: "oral",
    label: "Oral / vesicular type",
    reportText:
      "My cow has fever, there are lesions in her mouth and she is drooling. Milk has dropped a lot.",
    symptoms: ["fever", "mouth_lesions", "drooling", "reduced_milk"],
    species: "Cattle",
    animalsAffected: 1,
  },
  {
    key: "nodular",
    label: "Nodular skin type",
    reportText:
      "My cow has fever and many hard lumps have come up on her skin. She is eating less.",
    symptoms: ["fever", "skin_nodules", "swelling", "reduced_appetite"],
    species: "Cattle",
    animalsAffected: 1,
  },
  {
    key: "reproductive",
    label: "Reproductive type",
    reportText:
      "My cow has aborted. This has happened before also, she is not conceiving properly.",
    symptoms: ["abortion", "infertility"],
    species: "Cattle",
    animalsAffected: 1,
  },
];

// Symptom vocabulary for the form checkboxes.
export const SYMPTOM_OPTIONS = [
  { value: "fever", label: "Fever" },
  { value: "mouth_lesions", label: "Mouth lesions" },
  { value: "drooling", label: "Drooling / salivation" },
  { value: "reduced_milk", label: "Reduced milk yield" },
  { value: "reduced_appetite", label: "Reduced appetite" },
  { value: "lameness", label: "Lameness" },
  { value: "skin_nodules", label: "Skin nodules / lumps" },
  { value: "swelling", label: "Swelling" },
  { value: "nasal_discharge", label: "Nasal discharge" },
  { value: "coughing", label: "Coughing" },
  { value: "breathing_difficulty", label: "Difficulty breathing" },
  { value: "abortion", label: "Abortion" },
  { value: "retained_placenta", label: "Retained placenta" },
  { value: "infertility", label: "Repeated breeding failure" },
  { value: "unable_to_stand", label: "Unable to stand" },
  { value: "convulsions", label: "Convulsions" },
  { value: "circling", label: "Circling" },
  { value: "bleeding", label: "Bleeding" },
  { value: "sudden_death", label: "Sudden death" },
];
