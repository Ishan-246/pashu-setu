// SQLite storage driver using Node's BUILT-IN node:sqlite module.
//
// This is real SQLite — a real .db file, real SQL, real transactions — but it
// ships inside Node itself (22.5+), so there is NOTHING to compile and no
// Visual Studio / C++ build tools needed. That is why better-sqlite3 is gone.
//
// Same interface as jsonDriver.js.

import { DatabaseSync } from "node:sqlite";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.join(__dirname, "..", "..", "data");
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });

const db = new DatabaseSync(path.join(DATA_DIR, "pashu-setu.db"));

db.exec(`
CREATE TABLE IF NOT EXISTS cases (
  id                TEXT PRIMARY KEY,
  village           TEXT NOT NULL,
  species           TEXT NOT NULL,
  animalsAffected   INTEGER NOT NULL DEFAULT 1,
  symptoms          TEXT NOT NULL,
  reportText        TEXT,
  timestamp         TEXT NOT NULL,
  lat               REAL NOT NULL,
  lng               REAL NOT NULL,
  syndrome          TEXT NOT NULL,
  severityScore     INTEGER NOT NULL,
  severityLevel     TEXT NOT NULL,
  status            TEXT NOT NULL DEFAULT 'REPORTED'
);

CREATE TABLE IF NOT EXISTS cluster_actions (
  clusterKey          TEXT PRIMARY KEY,
  verificationStatus  TEXT NOT NULL DEFAULT 'PENDING',
  assignedTo          TEXT,
  labRequired         INTEGER NOT NULL DEFAULT 0,
  labStatus           TEXT NOT NULL DEFAULT 'NOT_REQUIRED',
  labResult           TEXT,
  responseStatus      TEXT NOT NULL DEFAULT 'NONE',
  responseNote        TEXT,
  updatedAt           TEXT
);
`);

const insert = db.prepare(`
  INSERT INTO cases (id, village, species, animalsAffected, symptoms, reportText,
                     timestamp, lat, lng, syndrome, severityScore, severityLevel, status)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`);
const selectAll = db.prepare("SELECT * FROM cases ORDER BY timestamp ASC");
const countStmt = db.prepare("SELECT COUNT(*) AS n FROM cases");
const getAction = db.prepare("SELECT * FROM cluster_actions WHERE clusterKey = ?");
const upsertAction = db.prepare(`
  INSERT INTO cluster_actions
    (clusterKey, verificationStatus, assignedTo, labRequired, labStatus,
     labResult, responseStatus, responseNote, updatedAt)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  ON CONFLICT(clusterKey) DO UPDATE SET
    verificationStatus = excluded.verificationStatus,
    assignedTo         = excluded.assignedTo,
    labRequired        = excluded.labRequired,
    labStatus          = excluded.labStatus,
    labResult          = excluded.labResult,
    responseStatus     = excluded.responseStatus,
    responseNote       = excluded.responseNote,
    updatedAt          = excluded.updatedAt
`);

export const name = "node:sqlite";

export function insertCase(r) {
  insert.run(
    r.id, r.village, r.species, r.animalsAffected,
    JSON.stringify(r.symptoms), r.reportText ?? null,
    r.timestamp, r.lat, r.lng, r.syndrome,
    r.severityScore, r.severityLevel, r.status
  );
  return r;
}

export function listCases() {
  return selectAll.all().map((r) => ({ ...r, symptoms: JSON.parse(r.symptoms) }));
}

export function countCases() {
  return Number(countStmt.get().n);
}

export function clearAll() {
  db.exec("DELETE FROM cases; DELETE FROM cluster_actions;");
}

export function getActionRow(clusterKey) {
  const row = getAction.get(clusterKey);
  return row ? { ...row, labRequired: !!row.labRequired } : null;
}

export function upsertActionRow(row) {
  upsertAction.run(
    row.clusterKey, row.verificationStatus, row.assignedTo ?? null,
    row.labRequired ? 1 : 0, row.labStatus, row.labResult ?? null,
    row.responseStatus, row.responseNote ?? null, row.updatedAt
  );
  return row;
}
