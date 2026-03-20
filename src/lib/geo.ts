/* ─── Geo Utilities ─────────────────────────────────────────────────────
   Point-in-polygon, radius checks, and distance calculations
   for service area validation.
   ──────────────────────────────────────────────────────────────────────── */

type Point = { lat: number; lng: number };

/**
 * Haversine distance between two points in miles.
 */
export function distanceMiles(a: Point, b: Point): number {
  const R = 3958.8; // Earth radius in miles
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const sinLat = Math.sin(dLat / 2);
  const sinLng = Math.sin(dLng / 2);
  const h =
    sinLat * sinLat +
    Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * sinLng * sinLng;
  return R * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
}

/**
 * Check if a point is within a radius (miles) of a center point.
 */
export function isWithinRadius(
  point: Point,
  center: Point,
  radiusMiles: number
): boolean {
  return distanceMiles(point, center) <= radiusMiles;
}

/**
 * Ray-casting point-in-polygon test.
 * polygon: array of [lng, lat] coordinate pairs (GeoJSON order).
 */
export function isPointInPolygon(
  point: Point,
  polygon: [number, number][]
): boolean {
  const { lat: y, lng: x } = point;
  let inside = false;

  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const [xi, yi] = polygon[i]; // [lng, lat]
    const [xj, yj] = polygon[j];

    if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) {
      inside = !inside;
    }
  }

  return inside;
}

/**
 * Check if a point is within a service area (either radius or polygon).
 */
export function isInServiceArea(
  point: Point,
  serviceArea: {
    type: "RADIUS" | "POLYGON" | null;
    radius?: number | null; // miles
    center?: { lat: number; lng: number } | null;
    polygon?: [number, number][] | null;
  }
): boolean {
  if (!serviceArea.type) return true; // No service area defined = allow all

  if (serviceArea.type === "RADIUS") {
    if (!serviceArea.center || !serviceArea.radius) return true;
    return isWithinRadius(point, serviceArea.center, serviceArea.radius);
  }

  if (serviceArea.type === "POLYGON") {
    if (!serviceArea.polygon || serviceArea.polygon.length < 3) return true;
    return isPointInPolygon(point, serviceArea.polygon);
  }

  return true;
}

function toRad(deg: number): number {
  return (deg * Math.PI) / 180;
}
