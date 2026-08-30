import React, { useEffect, useRef } from "react";
import * as maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import "./RiderMap.css";
import { fetchRouteWithETA } from "../../utils/routing";

const RESTAURANT_COORDS = [72.8296, 19.0544]; // Feasto Kitchen Central

const RiderMap = ({ riderCoords, customerCoords, isPickedUp }) => {
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const riderMarkerRef = useRef(null);
  const destMarkerRef = useRef(null);

  const currentRider = riderCoords ? [riderCoords.lng, riderCoords.lat] : [72.8310, 19.0600];
  const targetCoords = isPickedUp
    ? customerCoords || [72.8347, 19.1136]
    : RESTAURANT_COORDS;

  useEffect(() => {
    if (!mapContainerRef.current) return;

    const map = new maplibregl.Map({
      container: mapContainerRef.current,
      style: "https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json",
      center: currentRider,
      zoom: 13,
      attributionControl: false,
    });

    mapRef.current = map;

    // Create Rider Pin
    const riderEl = document.createElement("div");
    riderEl.className = "rider-marker";
    riderEl.innerHTML = `<svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M19 7c0-1.1-.9-2-2-2h-3v2h3v2.65L13.52 14H10V9H6c-2.21 0-4 1.79-4 4v3h2c0 1.66 1.34 3 3 3s3-1.34 3-3h4.18c.41 0 .8-.17 1.08-.47L19 12.35V7zM7 17c-.55 0-1-.45-1-1h2c0 .55-.45 1-1 1zm12 0c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3zm0-4c-.55 0-1 .45-1 1s.45 1 1 1 1-.45 1-1-.45-1-1-1z"/></svg>`;
    riderMarkerRef.current = new maplibregl.Marker({ element: riderEl })
      .setLngLat(currentRider)
      .addTo(map);

    // Create Destination Pin
    const destEl = document.createElement("div");
    destEl.className = "destination-marker";
    destEl.innerHTML = `<svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>`;
    destMarkerRef.current = new maplibregl.Marker({ element: destEl })
      .setLngLat(targetCoords)
      .addTo(map);

    map.on("load", async () => {
      // Draw navigation route
      const { geometry } = await fetchRouteWithETA(currentRider, targetCoords);
      if (geometry) {
        if (map.getSource("route")) {
          map.getSource("route").setData(geometry);
        } else {
          map.addSource("route", { type: "geojson", data: geometry });
          map.addLayer({
            id: "route-glow",
            type: "line",
            source: "route",
            layout: { "line-join": "round", "line-cap": "round" },
            paint: { "line-color": "#ff5722", "line-width": 8, "line-opacity": 0.25 },
          });
          map.addLayer({
            id: "route",
            type: "line",
            source: "route",
            layout: { "line-join": "round", "line-cap": "round" },
            paint: { "line-color": "#ff5722", "line-width": 4, "line-opacity": 0.95 },
          });
        }
      }
    });

    return () => {
      map.remove();
    };
  }, [isPickedUp]);

  // Update Rider live marker when coordinates change
  useEffect(() => {
    if (riderMarkerRef.current && riderCoords) {
      riderMarkerRef.current.setLngLat([riderCoords.lng, riderCoords.lat]);
    }
  }, [riderCoords]);

  const handleRecenter = () => {
    if (mapRef.current) {
      mapRef.current.flyTo({ center: currentRider, zoom: 15 });
    }
  };

  return (
    <div className="rider-map-wrapper">
      <div ref={mapContainerRef} className="maplibre-container" />
      <button className="map-recenter-btn" onClick={handleRecenter} title="Recenter on My GPS">
        <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
          <path d="M12 8c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4zm8.94 3c-.46-4.17-3.77-7.48-7.94-7.94V1h-2v2.06C6.83 3.52 3.52 6.83 3.06 11H1v2h2.06c.46 4.17 3.77 7.48 7.94 7.94V23h2v-2.06c4.17-.46 7.48-3.77 7.94-7.94H23v-2h-2.06zM12 19c-3.87 0-7-3.13-7-7s3.13-7 7-7 7 3.13 7 7-3.13 7-7 7z" />
        </svg>
      </button>
    </div>
  );
};

export default RiderMap;
