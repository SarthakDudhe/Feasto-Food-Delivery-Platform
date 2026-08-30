const OSRM_BASE = "https://router.project-osrm.org/route/v1/driving";

export async function fetchRouteGeometry(from, to) {
  try {
    const url = `${OSRM_BASE}/${from[0]},${from[1]};${to[0]},${to[1]}?overview=full&geometries=geojson`;
    const res = await fetch(url);
    if (!res.ok) return null;
    const data = await res.json();
    if (data.code === "Ok" && data.routes && data.routes[0]) {
      return data.routes[0].geometry;
    }
    return null;
  } catch (err) {
    console.warn("[Feasto Routing] fetchRouteGeometry failed:", err.message);
    return null;
  }
}

export async function fetchETA(from, to) {
  try {
    const url = `${OSRM_BASE}/${from[0]},${from[1]};${to[0]},${to[1]}?overview=false`;
    const res = await fetch(url);
    if (!res.ok) return null;
    const data = await res.json();
    if (data.code === "Ok" && data.routes && data.routes[0]) {
      const { duration, distance } = data.routes[0];
      return {
        etaMinutes: Math.ceil(duration / 60),
        distanceKm: Math.round(distance / 100) / 10,
      };
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
