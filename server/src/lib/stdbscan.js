// ST-DBSCAN — Spatio-Temporal DBSCAN.
//
// Ordinary DBSCAN groups points that are CLOSE IN SPACE.
// ST-DBSCAN adds a second condition: they must also be CLOSE IN TIME.
// We add a third: they must share the same SYNDROME.
//
// Two cases are "neighbours" only if all three hold:
//   1. same syndrome
//   2. distance  <= epsSpatialKm
//   3. time gap  <= epsTemporalHours
//
// A case with at least minPts neighbours (counting itself) is a CORE case.
// A cluster grows outward from core cases — which is why two villages more
// than 5 km apart can still land in ONE cluster, if cases in between link
// them. Cases that never join a cluster are NOISE (isolated reports).

import { distanceKm, hoursBetween } from "./haversine.js";

const UNVISITED = -2;
const NOISE = -1;

export function areNeighbours(a, b, params) {
  if (a.syndrome !== b.syndrome) return false;
  if (hoursBetween(a.timestamp, b.timestamp) > params.epsTemporalHours) return false;
  if (distanceKm(a, b) > params.epsSpatialKm) return false;
  return true;
}

function neighboursOf(index, cases, params) {
  const found = [];
  for (let i = 0; i < cases.length; i++) {
    if (areNeighbours(cases[index], cases[i], params)) found.push(i);
  }
  return found; // includes the point itself
}

export function stDbscan(cases, params) {
  const labels = new Array(cases.length).fill(UNVISITED);
  let clusterId = 0;

  for (let i = 0; i < cases.length; i++) {
    if (labels[i] !== UNVISITED) continue;

    const seeds = neighboursOf(i, cases, params);

    if (seeds.length < params.minPts) {
      labels[i] = NOISE; // may still be reclaimed below as a border case
      continue;
    }

    labels[i] = clusterId;

    // Density-reachable expansion. `queue` is appended to while we walk it —
    // that chaining is what links neighbouring villages into one cluster.
    const queue = seeds.filter((n) => n !== i);

    for (let q = 0; q < queue.length; q++) {
      const point = queue[q];

      if (labels[point] === NOISE) {
        labels[point] = clusterId; // border case, absorbed
        continue;
      }
      if (labels[point] !== UNVISITED) continue;

      labels[point] = clusterId;

      const pointNeighbours = neighboursOf(point, cases, params);
      if (pointNeighbours.length >= params.minPts) {
        for (const pn of pointNeighbours) {
          if (!queue.includes(pn)) queue.push(pn);
        }
      }
    }

    clusterId++;
  }

  // Turn the flat label array into usable groups of case objects.
  const clusters = [];
  for (let id = 0; id < clusterId; id++) {
    clusters.push(cases.filter((_, i) => labels[i] === id));
  }
  const noise = cases.filter((_, i) => labels[i] === NOISE);

  return { clusters, noise, labels };
}
