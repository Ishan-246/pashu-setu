// Great-circle distance between two lat/lng points, in kilometres.
// This is what replaces PostGIS for our scale (tens of points, not millions).

const EARTH_RADIUS_KM = 6371;

const toRadians = (degrees) => (degrees * Math.PI) / 180;

export function distanceKm(a, b) {
  const dLat = toRadians(b.lat - a.lat);
  const dLng = toRadians(b.lng - a.lng);
  const lat1 = toRadians(a.lat);
  const lat2 = toRadians(b.lat);

  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;

  return 2 * EARTH_RADIUS_KM * Math.asin(Math.sqrt(h));
}

// Absolute time gap between two ISO timestamps, in hours.
export function hoursBetween(isoA, isoB) {
  const ms = Math.abs(new Date(isoA).getTime() - new Date(isoB).getTime());
  return ms / (1000 * 60 * 60);
}
