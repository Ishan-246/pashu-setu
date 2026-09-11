// JSON-file storage driver. Zero dependencies, works on every Node version.
//
// Implements the same interface as sqliteDriver.js. Nothing above the driver
// layer knows which one is running.

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.join(__dirname, "..", "..", "data");
const FILE = path.join(DATA_DIR, "store.json");

const EMPTY = { cases: [], actions: {} };

function load() {
  try {
    if (!fs.existsSync(FILE)) return structuredClone(EMPTY);
    const parsed = JSON.parse(fs.readFileSync(FILE, "utf8"));
    return { cases: parsed.cases ?? [], actions: parsed.actions ?? {} };
  } catch {
    return structuredClone(EMPTY);
  }
}

function save(state) {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  fs.writeFileSync(FILE, JSON.stringify(state, null, 2));
}

export const name = "json-file";

export function insertCase(record) {
  const s = load();
  s.cases.push(record);
  save(s);
  return record;
}

export function listCases() {
  return load().cases.sort((a, b) => a.timestamp.localeCompare(b.timestamp));
}

export function countCases() {
  return load().cases.length;
}

export function clearAll() {
  save(structuredClone(EMPTY));
}

export function getActionRow(clusterKey) {
  return load().actions[clusterKey] ?? null;
}

export function upsertActionRow(row) {
  const s = load();
  s.actions[row.clusterKey] = row;
  save(s);
  return row;
}
