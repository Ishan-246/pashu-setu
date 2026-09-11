// Runs the full test suite twice — once on each storage driver — and proves
// they produce identical clustering results.
import { spawnSync } from "node:child_process";
import fs from "node:fs";

const results = {};
for (const store of ["sqlite", "json"]) {
  fs.rmSync(new URL("../data", import.meta.url), { recursive: true, force: true });
  const r = spawnSync(process.execPath, ["test/cluster.test.js"], {
    env: { ...process.env, STORE: store },
    encoding: "utf8",
  });
  process.stdout.write(r.stdout);
  if (r.stderr) process.stderr.write(r.stderr);
  const priority = r.stdout.match(/PRIORITY\s+(\d+)\s+->\s+(\w+)/);
  results[store] = priority ? `${priority[1]} ${priority[2]}` : "no result";
  if (r.status !== 0) process.exitCode = 1;
}

console.log("=".repeat(56));
console.log("  sqlite driver ->", results.sqlite);
console.log("  json   driver ->", results.json);
console.log(
  results.sqlite === results.json
    ? "  IDENTICAL — swapping storage does not change the clustering."
    : "  MISMATCH — drivers disagree."
);
console.log("=".repeat(56));
if (results.sqlite !== results.json) process.exitCode = 1;
