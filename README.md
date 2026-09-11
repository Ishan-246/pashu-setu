# Pashu-Setu — Round 2 prototype

Turns scattered livestock health reports into spatio-temporal cluster signals,
combines them with existing risk context, and prioritises them for veterinary
action.

## Requirements

Node.js only. **No Python, no Visual Studio, no C++ build tools.**
The server has exactly two dependencies: `express` and `cors`.

## Run it — two terminals

Terminal 1, backend:
```
cd server
npm install
npm test
npm start
```

Terminal 2, frontend:
```
cd client
npm install
npm run dev
```

Open http://localhost:5173

## Storage

SQLite is the database. Node 22.5 and newer ship SQLite **inside Node itself**
(`node:sqlite`), so there is nothing to compile. `better-sqlite3` has been
removed entirely — that was the package demanding Visual Studio.

On startup the server prints which driver it chose:

```
Storage driver: node:sqlite  (Node v24.19.0)
```

Force either driver:

```
npm start                      auto-detect (SQLite if available)
set STORE=sqlite && npm start  force SQLite      (Windows cmd)
set STORE=json && npm start    force JSON file   (Windows cmd)
$env:STORE="json"; npm start   PowerShell
STORE=json npm start           macOS / Linux
```

On Node older than 22.5 it falls back to the JSON file driver automatically
and says so. Data lives in `server/data/` either way.

Prove the two drivers are equivalent:

```
npm run test:json
```

That runs the whole suite twice, once per driver, and compares the final
priority score. Both must print `71 HIGH`.

## Testing Module 2 from the server folder

```
cd server
npm install
npm test              # 11 tests, auto-selected driver
npm run test:json     # same suite on BOTH drivers, then compares
npm start             # then in another terminal, cd client && npm run dev
```

## The demo, in order

1. **Report intake** → **Load 1 report** → one dot on the map, no cluster.
2. **Load 3** → cluster appears, priority MEDIUM.
3. **Load full scenario** → 7 cases, 3 villages, priority HIGH.
4. Submit a live report using a preset → case count and priority both move.
   This is the answer to *"what if I add another case?"*
5. **Veterinary dashboard** → queue sorted by priority.
6. Click the cluster → risk fusion breakdown, then walk the buttons:
   Verification → Lab → Response status.

## Layout

```
server/
  src/lib/          haversine · stdbscan · triage · riskFusion   (Module 1)
  src/storage/      index (driver selector) · sqliteDriver · jsonDriver
  src/store/        caseStore · actionStore   (delegate to the driver)
  src/data/         villages · riskContext (SIMULATED NADRES) · sample cases
  src/services/     clusterService — runs the pipeline in order
  src/routes/       api.js
  test/             cluster.test.js · run-both-drivers.js
client/
  src/components/   ReportForm · VetQueue · ClusterDetail · ClusterMap
```

`src/lib/stdbscan.js` and `src/lib/riskFusion.js` have not changed since
Module 1. The storage swap is contained to `src/storage/` and `src/store/`.

## What is simulated

Village coordinates, the NADRES-style risk table, the sample cases, and the
verification / lab / government response steps are all **demo data and demo
statuses**. There is no vet scheduling, no notifications, no laboratory
system, no government API — the workflow is dashboard buttons that move a
status field, which is deliberate for Round 2.

`server/src/data/riskContext.js` is the integration boundary. Swapping that
one file for a real authorised feed is the entire production change.

5 km, 48 hours and minimum 3 cases are **prototype parameters**, not validated
epidemiological thresholds. They live in `server/src/config.js` and can be
overridden live: `/api/clusters?epsKm=3&epsHours=24&minPts=4`.

The system never produces a diagnosis. It produces a suspected health event.
The veterinarian verifies; the laboratory confirms.
