import { Router } from "express";
import * as store from "../store/caseStore.js";
import * as actions from "../store/actionStore.js";
import { analyse } from "../services/clusterService.js";
import { VILLAGES } from "../data/villages.js";
import { SYNDROMES } from "../lib/triage.js";
import { PRESET_REPORTS, SYMPTOM_OPTIONS } from "../data/presetReports.js";
import { RISK_DISCLAIMER } from "../data/riskContext.js";

const router = Router();

// Reference data the report form needs.
router.get("/meta", (req, res) => {
  res.json({
    villages: VILLAGES,
    syndromes: Object.values(SYNDROMES),
    symptomOptions: SYMPTOM_OPTIONS,
    presetReports: PRESET_REPORTS,
    workflow: actions.WORKFLOW,
    riskDisclaimer: RISK_DISCLAIMER,
  });
});

// Submit one report. In production this is what the helpline/IVR would POST.
router.post("/cases", (req, res) => {
  try {
    const { village, symptoms } = req.body ?? {};
    if (!village) return res.status(400).json({ error: "village is required" });
    if (!Array.isArray(symptoms) || symptoms.length === 0)
      return res.status(400).json({ error: "at least one symptom is required" });
    res.status(201).json(store.addCase(req.body));
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.get("/cases", (req, res) => res.json(store.allCases()));

// Run clustering + fusion. This IS the vet queue.
router.get("/clusters", (req, res) => {
  const o = {};
  if (req.query.epsKm) o.epsSpatialKm = Number(req.query.epsKm);
  if (req.query.epsHours) o.epsTemporalHours = Number(req.query.epsHours);
  if (req.query.minPts) o.minPts = Number(req.query.minPts);
  res.json(analyse(store.allCases(), o));
});

// Vet / lab / response workflow.
router.patch("/clusters/:clusterKey/action", (req, res) => {
  try {
    const key = decodeURIComponent(req.params.clusterKey);
    res.json(actions.updateAction(key, req.body ?? {}));
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Demo controls.
router.post("/demo/seed", (req, res) => res.json(store.seed(req.body?.count)));
router.post("/demo/reset", (req, res) => {
  store.reset();
  res.json({ ok: true });
});

export default router;
