# Pashu-Setu — clustering engine (Module 1)

The intelligence layer only. No UI yet. The report form and dashboard plug
into this later without changing any file in `src/lib/`.

## Run it

```
cd server
npm install
npm test        # proves the clustering works
npm start       # API on http://localhost:4000
```

Node 18 or newer. Nothing else to install — no database server, no PostGIS.

## What each file does

```
server/
├── package.json
├── src/
│   ├── config.js               all tunable numbers in ONE place
│   ├── lib/
│   │   ├── haversine.js        distance between two lat/lng, in km
│   │   ├── stdbscan.js         ← the core algorithm
│   │   ├── triage.js           symptoms → syndrome + severity
│   │   └── riskFusion.js       cluster + severity + risk → priority
│   ├── data/
│   │   ├── villages.js         fixed village coordinates
│   │   ├── riskContext.js      SIMULATED NADRES risk layer
│   │   └── sampleCases.js      the 9-case demo scenario
│   ├── store/caseStore.js      in-memory cases (swap for SQLite here only)
│   ├── services/clusterService.js   runs the pipeline in order
│   ├── routes/api.js           HTTP endpoints
│   └── server.js               express entry point
└── test/cluster.test.js        10 tests + readable demo output
```

## API

| Method | Path | Purpose |
|---|---|---|
| GET | `/api/meta` | villages + syndromes, for the form dropdowns |
| POST | `/api/cases` | submit one report |
| GET | `/api/cases` | all stored cases |
| GET | `/api/clusters` | run clustering + fusion, returns the vet queue |
| POST | `/api/demo/seed` | load the demo scenario (`{"count": 3}` for partial) |
| POST | `/api/demo/reset` | clear everything |

`/api/clusters` accepts `?epsKm=5&epsHours=48&minPts=3` to override the
parameters live — useful if a judge asks "what if you change the radius?"

Submit a report:

```
curl -X POST localhost:4000/api/cases -H "Content-Type: application/json" \
  -d '{"village":"Village B","species":"Cattle","animalsAffected":2,
       "symptoms":["fever","mouth_lesions","drooling"],
       "timestamp":"2026-09-09T22:00:00+05:30"}'
```

## How the clustering decides

Two cases are neighbours only if **all three** hold:

1. same syndrome
2. within `epsSpatialKm` (5 km)
3. within `epsTemporalHours` (48 h)

A case with `minPts` (3) or more neighbours is a **core** case. Clusters grow
outward from core cases, which is why Village B and Village C end up in the
same cluster even though they are 6.2 km apart — cases in Village A link them.
Cases that never join a cluster are **isolated reports**, not outbreaks.

## Priority

```
priority = 0.40 × cluster strength
         + 0.30 × mean severity
         + 0.30 × risk context
```

Cluster strength = size (60) + village spread (25) + tempo (15).
Bands: ≤30 LOW · ≤60 MEDIUM · ≤80 HIGH · >80 CRITICAL.

All weights live in `src/config.js`.

## Demo data

Village coordinates, the NADRES risk table and the sample cases are all
**simulated demo data**. There is no connection to any government system.
`src/data/riskContext.js` is the integration boundary — replacing that one
file with a real feed is the entire production change.
