const OSRM_BASE = "https://router.project-osrm.org/route/v1/driving";

// In-memory cache for OSRM routes & ETAs to prevent redundant network calls
const routeCache = new Map();
const etaCache = new Map();

// Helper to create a cache key rounded to ~10 meters precision
function getCacheKey(from, to) {
  const fLat = from[1].toFixed(4);
  const fLng = from[0].toFixed(4);
  const tLat = to[1].toFixed(4);
  const tLng = to[0].toFixed(4);
  return `${fLng},${fLat};${tLng},${tLat}`;
}

export async function fetchRouteGeometry(from, to) {
  const key = getCacheKey(from, to);
  if (routeCache.has(key)) {
    return routeCache.get(key);
  }

  try {
    const url = `${OSRM_BASE}/${from[0]},${from[1]};${to[0]},${to[1]}?overview=full&geometries=geojson`;
    const res = await fetch(url);
    if (!res.ok) return null;
    const data = await res.json();
    if (data.code === "Ok" && data.routes && data.routes[0]) {
      const geometry = data.routes[0].geometry;
      // Cache the geometry (limit cache size to 50 items)
      if (routeCache.size > 50) {
        const firstKey = routeCache.keys().next().value;
        routeCache.delete(firstKey);
      }
      routeCache.set(key, geometry);
      return geometry;
    }
    return null;
  } catch (err) {
    console.warn("[Feasto Routing] fetchRouteGeometry failed:", err.message);
    return null;
  }
}

export async function fetchETA(from, to) {
  const key = getCacheKey(from, to);
  if (etaCache.has(key)) {
    return etaCache.get(key);
  }

  try {
    const url = `${OSRM_BASE}/${from[0]},${from[1]};${to[0]},${to[1]}?overview=false`;
    const res = await fetch(url);
    if (!res.ok) return null;
    const data = await res.json();
    if (data.code === "Ok" && data.routes && data.routes[0]) {
      const { duration, distance } = data.routes[0];
      const result = {
        etaMinutes: Math.ceil(duration / 60),
        distanceKm: Math.round(distance / 100) / 10,
      };
      if (etaCache.size > 50) {
        const firstKey = etaCache.keys().next().value;
        etaCache.delete(firstKey);
      }
      etaCache.set(key, result);
      return result;
    }
    return null;
  } catch (err) {
    console.warn("[Feasto Routing] fetchETA failed:", err.message);
    return null;
  }
}

export async function fetchRouteWithETA(from, to) {
  const [geometry, eta] = await Promise.all([
    fetchRouteGeometry(from, to),
    fetchETA(from, to),
  ]);
  return { geometry, eta };
}
