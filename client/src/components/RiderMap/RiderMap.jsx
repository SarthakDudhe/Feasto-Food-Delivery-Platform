import React, { useEffect, useRef, useState, useCallback } from "react";
import * as maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import "./RiderMap.css";
import { fetchRouteWithETA } from "../../utils/routing";

const KITCHEN_HUB = {
  coords: [72.8296, 19.0544],
  name: "Feasto Central Kitchen",
};

const DEFAULT_CUSTOMER = {
  coords: [72.8347, 19.1136],
  name: "Customer Address",
};

function safeRemove(map, id) {
  if (map.getLayer(id)) map.removeLayer(id);
  if (map.getSource(id)) map.removeSource(id);
}

function drawSolidRoute(map, id, geojson) {
  safeRemove(map, id + "-glow");
  safeRemove(map, id);
  map.addSource(id, { type: "geojson", data: geojson });
  map.addLayer({
    id: id + "-glow",
    type: "line",
    source: id,
    layout: { "line-join": "round", "line-cap": "round" },
    paint: { "line-color": "#ff5a3d", "line-width": 12, "line-opacity": 0.18, "line-blur": 6 },
  });
  map.addLayer({
    id,
    type: "line",
    source: id,
    layout: { "line-join": "round", "line-cap": "round" },
    paint: { "line-color": "#ff5a3d", "line-width": 5, "line-opacity": 0.95 },
  });
}

function createMarkerElement(emoji, label, typeClass) {
  const el = document.createElement("div");
  el.className = `rm-marker rm-marker--${typeClass}`;
  el.innerHTML = `
    <div class="rm-marker__bubble"><span class="rm-marker__emoji">${emoji}</span></div>
    <div class="rm-marker__label">${label}</div>`;
  return el;
}

export default function RiderMap({ order, riderLocation }) {
  const mapContainer = useRef(null);
  const mapRef = useRef(null);
  const markersRef = useRef([]);

  const [mapReady, setMapReady] = useState(false);
  const [routeData, setRouteData] = useState(null);

  // Derive coordinates
  const customerCoords = (order?.address?.lng && order?.address?.lat)
    ? [order.address.lng, order.address.lat]
    : DEFAULT_CUSTOMER.coords;

  const currentRiderCoords = riderLocation || [
    order?.riderLng || KITCHEN_HUB.coords[0],
    order?.riderLat || KITCHEN_HUB.coords[1]
  ];

  // Initialize MapLibre
  useEffect(() => {
    if (mapRef.current) return;

    const map = new maplibregl.Map({
      container: mapContainer.current,
      style: "https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json",
      center: currentRiderCoords,
      zoom: 13,
      attributionControl: false,
    });

    map.addControl(new maplibregl.NavigationControl({ showCompass: false }), "top-right");

    map.on("load", () => {
      mapRef.current = map;
      setMapReady(true);
    });

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Update Markers and Route when map is ready or props change
  useEffect(() => {
    if (!mapReady || !mapRef.current) return;
    const map = mapRef.current;

    // Clear old markers
    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    // Add Kitchen Pin
    const mKitchen = new maplibregl.Marker({
      element: createMarkerElement("🏢", KITCHEN_HUB.name, "kitchen"),
      anchor: "bottom",
    }).setLngLat(KITCHEN_HUB.coords).addTo(map);

    // Add Rider Live Pin
    const mRider = new maplibregl.Marker({
      element: createMarkerElement("🛵", "You (Rider)", "rider"),
      anchor: "bottom",
    }).setLngLat(currentRiderCoords).addTo(map);

    // Add Customer Destination Pin
    const custLabel = order?.address?.firstName 
      ? `Dropoff: ${order.address.firstName}` 
      : "Customer Dropoff";
    const mCustomer = new maplibregl.Marker({
      element: createMarkerElement("📍", custLabel, "customer"),
      anchor: "bottom",
    }).setLngLat(customerCoords).addTo(map);

    markersRef.current = [mKitchen, mRider, mCustomer];

    // Fetch Route from Rider to Customer
    const updateRoute = async () => {
      const routeResult = await fetchRouteWithETA(currentRiderCoords, customerCoords);
      if (!mapRef.current) return;

      if (routeResult.geometry) {
        drawSolidRoute(map, "rider-route", routeResult.geometry);
      }

      if (routeResult.eta) {
        setRouteData(routeResult.eta);
      }

      // Adjust camera bounds to fit pins
      const bounds = new maplibregl.LngLatBounds();
      [KITCHEN_HUB.coords, currentRiderCoords, customerCoords].forEach((c) => bounds.extend(c));
      map.fitBounds(bounds, {
        padding: { top: 60, bottom: 60, left: 50, right: 50 },
        maxZoom: 15,
        duration: 1000
      });
    };

    updateRoute();
  }, [mapReady, order, currentRiderCoords[0], currentRiderCoords[1]]);

  // Google Maps Turn-by-Turn Navigation URL
  const googleNavUrl = `https://www.google.com/maps/dir/?api=1&origin=${currentRiderCoords[1]},${currentRiderCoords[0]}&destination=${customerCoords[1]},${customerCoords[0]}&travelmode=driving`;

  return (
    <div className="rm-container">
      {/* Map Canvas */}
      <div ref={mapContainer} className="rm-map-canvas" />

      {/* Floating Info & Navigation Bar */}
      <div className="rm-overlay-bar">
        {routeData && (
          <div className="rm-eta-badge">
            <span className="eta-icon">⏱️</span>
            <div>
              <strong>~{routeData.etaMinutes} min</strong>
              <small>{routeData.distanceKm} km away</small>
            </div>
          </div>
        )}

        <a 
          href={googleNavUrl} 
          target="_blank" 
          rel="noopener noreferrer" 
          className="rm-google-nav-btn"
        >
          <span>🧭</span> Start Google Maps Nav
        </a>
      </div>
    </div>
  );
}
