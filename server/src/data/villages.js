// Fixed village coordinates for the prototype (Dhule / Shirpur belt,
// North Maharashtra). The report form will offer these in a dropdown, which
// is also how each case gets its location without needing GPS.
export const VILLAGES = {
  "Village A": { lat: 21.3486, lng: 74.8811 },
  "Village B": { lat: 21.3800, lng: 74.9050 },
  "Village C": { lat: 21.3250, lng: 74.9150 },
  "Village D": { lat: 21.6000, lng: 75.2000 },
  "Village E": { lat: 21.2900, lng: 74.8400 },
};

export function coordsFor(village) {
  const c = VILLAGES[village];
  if (!c) throw new Error(`Unknown village: ${village}`);
  return c;
}
