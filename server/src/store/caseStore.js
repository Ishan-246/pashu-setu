// Case store.
//
// SAME PUBLIC INTERFACE it has had since Module 1:
//   addCase(report) / allCases() / reset() / seed(count)
//
// It delegates to whichever storage driver was selected in src/storage/.
// Nothing in src/lib/ or src/services/ knows or cares which one is running.

import { driver } from "../storage/index.js";
import { triage } from "../lib/triage.js";
import { coordsFor } from "../data/villages.js";
import { SAMPLE_REPORTS } from "../data/sampleCases.js";

export function addCase(report) {
  const coords = coordsFor(report.village);
  const t = triage({
    symptoms: report.symptoms,
    animalsAffected: report.animalsAffected ?? 1,
  });

  const record = {
    id: report.id ?? `C-${2000 + driver.countCases() + 1}`,
    village: report.village,
    species: report.species ?? "Cattle",
    animalsAffected: report.animalsAffected ?? 1,
    symptoms: report.symptoms,
    reportText: report.reportText ?? null,
    timestamp: report.timestamp ?? new Date().toISOString(),
    lat: coords.lat,
    lng: coords.lng,
    syndrome: t.syndrome,
    severityScore: t.severityScore,
    severityLevel: t.severityLevel,
    status: "REPORTED",
  };

  return driver.insertCase(record);
}

export function allCases() {
  return driver.listCases();
}

export function reset() {
  driver.clearAll();
}

export function seed(count = SAMPLE_REPORTS.length) {
  reset();
  SAMPLE_REPORTS.slice(0, count).forEach(addCase);
  return allCases();
}
