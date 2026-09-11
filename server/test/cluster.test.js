// Run with: npm test
// These are the claims a judge can poke at. If any fail, the demo is lying.

import assert from "node:assert/strict";
import * as store from "../src/store/caseStore.js";
import { analyse } from "../src/services/clusterService.js";
import { distanceKm } from "../src/lib/haversine.js";
import { VILLAGES } from "../src/data/villages.js";
import { driverName } from "../src/storage/index.js";
import { clusterKeyFor, updateAction, getAction } from "../src/store/actionStore.js";
import { SAMPLE_REPORTS } from "../src/data/sampleCases.js";

let passed = 0;
function test(name, fn) {
  try {
    const out = fn();
    if (out && typeof out.then === "function") {
      throw new Error("test functions must be synchronous");
    }
    console.log(`  PASS  ${name}`);
    passed++;
  } catch (err) {
    console.error(`  FAIL  ${name}\n        ${err.message}`);
    process.exitCode = 1;
  }
}

console.log("\nPashu-Setu clustering engine");
console.log(`Node ${process.version} · storage driver: ${driverName}\n`);

console.log("Distances (sanity check on village layout)");
for (const [name, c] of Object.entries(VILLAGES)) {
  if (name === "Village A") continue;
  const d = distanceKm(VILLAGES["Village A"], c);
  console.log(`  Village A -> ${name}: ${d.toFixed(2)} km`);
}

console.log("\nTests");

test("one isolated report produces no cluster", () => {
  store.seed(1);
  const r = analyse(store.allCases());
  assert.equal(r.clusters.length, 0);
  assert.equal(r.isolatedCases.length, 1);
});

test("two related reports still produce no cluster (minPts = 3)", () => {
  store.seed(2);
  const r = analyse(store.allCases());
  assert.equal(r.clusters.length, 0);
});

test("three related reports form a cluster", () => {
  store.seed(3);
  const r = analyse(store.allCases());
  assert.equal(r.clusters.length, 1);
  assert.equal(r.clusters[0].cases.length, 3);
});

test("full scenario: 7 cases, 3 villages, one cluster", () => {
  store.seed();
  const r = analyse(store.allCases());
  assert.equal(r.clusters.length, 1, `got ${r.clusters.length} clusters`);
  const c = r.clusters[0];
  assert.equal(c.cases.length, 7, `got ${c.cases.length} cases`);
  assert.equal(c.signal.villageCount, 3);
  assert.ok(c.signal.windowHours >= 30 && c.signal.windowHours <= 40);
});

test("different syndrome far away stays isolated", () => {
  store.seed();
  const r = analyse(store.allCases());
  assert.ok(r.isolatedCases.some((c) => c.id === "C-1008"));
});

test("same village but outside the time window stays isolated", () => {
  store.seed();
  const r = analyse(store.allCases());
  assert.ok(r.isolatedCases.some((c) => c.id === "C-1009"));
});

test("priority rises as cases accumulate", () => {
  store.seed(3);
  const small = analyse(store.allCases()).clusters[0].priorityScore;
  store.seed();
  const big = analyse(store.allCases()).clusters[0].priorityScore;
  assert.ok(big > small, `expected ${big} > ${small}`);
});

test("full scenario reaches HIGH or CRITICAL priority", () => {
  store.seed();
  const c = analyse(store.allCases()).clusters[0];
  assert.ok(["HIGH", "CRITICAL"].includes(c.priorityLabel), c.priorityLabel);
});

test("tightening the radius breaks the cluster apart", () => {
  store.seed();
  const tight = analyse(store.allCases(), { epsSpatialKm: 1 });
  assert.ok(tight.clusters.length === 0 || tight.clusters[0].cases.length < 7);
});

test("nothing is ever labelled a diagnosis", () => {
  store.seed();
  const r = analyse(store.allCases());
  assert.equal(r.clusters[0].isDiagnosis, false);
  assert.match(r.clusters[0].status, /SUSPECTED/);
});

test("workflow status persists and survives new cases joining", () => {
  store.seed(3);
  let c = analyse(store.allCases()).clusters[0];
  const key = clusterKeyFor(c.cases, c.syndrome);

  updateAction(key, {
    verificationStatus: "UNDER_VERIFICATION",
    assignedTo: "Dr. Patil",
  });
  assert.equal(getAction(key).verificationStatus, "UNDER_VERIFICATION");

  // New reports arrive at the SAME cluster. seed() is not used here because
  // seeding resets the whole store, which is a demo control, not an arrival.
  SAMPLE_REPORTS.slice(3, 7).forEach((r) => store.addCase(r));

  c = analyse(store.allCases()).clusters[0];
  assert.equal(c.cases.length, 7, `expected 7 cases, got ${c.cases.length}`);
  assert.equal(c.clusterKey, key, "cluster key must stay stable");
  assert.equal(c.action.verificationStatus, "UNDER_VERIFICATION");
  assert.equal(c.action.assignedTo, "Dr. Patil");
});

test("a full workflow walk persists across reads", () => {
  store.seed(7);
  const c = analyse(store.allCases()).clusters[0];
  updateAction(c.clusterKey, { verificationStatus: "VERIFIED" });
  updateAction(c.clusterKey, { labStatus: "SAMPLE_COLLECTED", labRequired: true });
  updateAction(c.clusterKey, { labStatus: "RESULT_READY", labResult: "CONFIRMED" });
  updateAction(c.clusterKey, { responseStatus: "VACCINATION_LOGGED" });

  const a = analyse(store.allCases()).clusters[0].action;
  assert.equal(a.verificationStatus, "VERIFIED");
  assert.equal(a.labRequired, true);
  assert.equal(a.labStatus, "RESULT_READY");
  assert.equal(a.labResult, "CONFIRMED");
  assert.equal(a.responseStatus, "VACCINATION_LOGGED");
});

test("resetting the demo clears workflow state too", () => {
  store.seed(7);
  const c = analyse(store.allCases()).clusters[0];
  updateAction(c.clusterKey, { verificationStatus: "VERIFIED" });
  store.reset();
  store.seed(7);
  assert.equal(
    analyse(store.allCases()).clusters[0].action.verificationStatus,
    "PENDING"
  );
});

// ---- readable output for the demo ----------------------------------------
store.seed();
const result = analyse(store.allCases());
const c = result.clusters[0];

console.log("\nFull scenario result\n");
console.log(`  Cluster        ${c.clusterId}`);
console.log(`  Syndrome       ${c.syndrome}`);
console.log(`  Cases          ${c.signal.caseCount}`);
console.log(`  Villages       ${c.signal.villageCount} (${c.signal.villages.join(", ")})`);
console.log(`  Time window    ${c.signal.windowHours} hours`);
console.log(`  Radius         ${c.geometry.radiusKm} km`);
console.log(`  ---`);
console.log(`  Cluster strength  ${c.breakdown.clusterStrength}  x0.40`);
console.log(`  Severity          ${c.breakdown.severity}  x0.30`);
console.log(`  Risk context      ${c.breakdown.riskContext}  x0.30  (${c.risk.level}, ${c.risk.village})`);
console.log(`  PRIORITY          ${c.priorityScore}  ->  ${c.priorityLabel}`);
console.log(`  Status            ${c.status}`);
console.log(`\n  Isolated: ${result.isolatedCases.map((i) => i.id).join(", ")}`);

console.log("\nGrowth curve (priority as reports arrive)");
for (let n = 1; n <= 7; n++) {
  store.seed(n);
  const r = analyse(store.allCases());
  const cl = r.clusters[0];
  console.log(
    `  ${n} report(s): ${cl ? `cluster of ${cl.cases.length}, priority ${cl.priorityScore} ${cl.priorityLabel}` : "no cluster"}`
  );
}

console.log(`\n${passed} passed\n`);
