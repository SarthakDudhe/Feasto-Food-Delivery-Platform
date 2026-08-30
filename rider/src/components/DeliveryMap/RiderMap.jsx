import React, { useEffect, useRef, useState } from "react";
import * as maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import "./RiderMap.css";
import { fetchRouteWithETA } from "../../utils/routing";

const RESTAURANT_COORDS = [72.8296, 19.0544]; // Feasto Kitchen, Bandra
const CUSTOMER_DEFAULT = [72.8347, 19.1136]; // Customer Dropoff

const RiderMap = ({ riderCoords, customerCoords, isPickedUp }) => {
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const riderMarkerRef = useRef(null);
  const destMarkerRef = useRef(null);
  const animFrameRef = useRef(null);

  const [is3D, setIs3D] = useState(true);
  const [etaInfo, setEtaInfo] = useState({ etaMinutes: 8, distanceKm: 2.4 });
  const [isSimulating, setIsSimulating] = useState(false);
  const [maneuverText, setManeuverText] = useState(
    isPickedUp ? "Deliver to customer location" : "Head to Feasto Kitchen pickup"
  );

  const currentRider = riderCoords ? [riderCoords.lng, riderCoords.lat] : [72.8310, 19.0600];
  const targetCoords = isPickedUp
    ? customerCoords || CUSTOMER_DEFAULT
    : RESTAURANT_COORDS;

  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Advanced 3D perspective camera
    const map = new maplibregl.Map({
      container: mapContainerRef.current,
      style: "https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json",
      center: currentRider,
      zoom: 14.2,
      pitch: 45, // 3D Tilt
      bearing: -12, // Isometric rotation
      attributionControl: false,
    });

    mapRef.current = map;

    // Create 3D Rider Marker with Radar Wave
    const riderEl = document.createElement("div");
    riderEl.className = "premium-rider-marker";
    riderEl.innerHTML = `
      <div class="radar-halo-ring"></div>
      <div class="rider-avatar-puck">
        <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor">
          <path d="M19 7c0-1.1-.9-2-2-2h-3v2h3v2.65L13.52 14H10V9H6c-2.21 0-4 1.79-4 4v3h2c0 1.66 1.34 3 3 3s3-1.34 3-3h4.18c.41 0 .8-.17 1.08-.47L19 12.35V7zM7 17c-.55 0-1-.45-1-1h2c0 .55-.45 1-1 1zm12 0c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3zm0-4c-.55 0-1 .45-1 1s.45 1 1 1 1-.45 1-1-.45-1-1-1z"/>
        </svg>
      </div>
      <div class="rider-tag-bubble">Captain • Live GPS</div>
    `;

    riderMarkerRef.current = new maplibregl.Marker({ element: riderEl })
      .setLngLat(currentRider)
      .addTo(map);

    // Create Destination Pin
    const destEl = document.createElement("div");
    destEl.className = "premium-destination-marker";
    destEl.innerHTML = `
      <div class="dest-avatar-puck ${isPickedUp ? "dropoff-customer" : "pickup-kitchen"}">
        <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
          <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
        </svg>
      </div>
      <div class="dest-tag-bubble">${isPickedUp ? "Customer Dropoff" : "Feasto Kitchen"}</div>
    `;

    destMarkerRef.current = new maplibregl.Marker({ element: destEl })
      .setLngLat(targetCoords)
      .addTo(map);

    map.on("load", async () => {
      // Draw navigation route with dynamic glowing gradient
      const { geometry, eta } = await fetchRouteWithETA(currentRider, targetCoords);
      if (eta) setEtaInfo(eta);

      if (geometry) {
        if (!map.getSource("route")) {
          map.addSource("route", { type: "geojson", data: geometry });

          // Ambient Glow Layer
          map.addLayer({
            id: "route-glow",
            type: "line",
            source: "route",
            layout: { "line-join": "round", "line-cap": "round" },
            paint: { "line-color": "#ff5a3d", "line-width": 14, "line-opacity": 0.28, "line-blur": 6 },
          });

          // Crisp Highway Line
          map.addLayer({
            id: "route-base",
            type: "line",
            source: "route",
            layout: { "line-join": "round", "line-cap": "round" },
            paint: { "line-color": "#ff5a3d", "line-width": 6, "line-opacity": 0.95 },
          });

          // Animated Dash Layer
          map.addLayer({
            id: "route-dash",
            type: "line",
            source: "route",
            layout: { "line-join": "round", "line-cap": "round" },
            paint: { "line-color": "#ffffff", "line-width": 3, "line-dasharray": [0, 3, 3] },
          });

          // Animate Dashed Line
          let step = 0;
          const animateDash = () => {
            step = (step + 1) % 100;
            if (map.getLayer("route-dash")) {
              map.setPaintProperty("route-dash", "line-dasharray", [
                0,
                (step % 6),
                3,
              ]);
            }
            animFrameRef.current = requestAnimationFrame(animateDash);
          };
          animateDash();
        }
      }
    });

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      map.remove();
    };
  }, [isPickedUp]);

  // Update Rider live marker when GPS updates
  useEffect(() => {
    if (riderMarkerRef.current && riderCoords) {
      riderMarkerRef.current.setLngLat([riderCoords.lng, riderCoords.lat]);
    }
  }, [riderCoords]);

  // 3D / 2D Perspective Toggle
  const togglePerspective = () => {
    if (!mapRef.current) return;
    const nextState = !is3D;
    setIs3D(nextState);
    mapRef.current.easeTo({
      pitch: nextState ? 45 : 0,
      bearing: nextState ? -12 : 0,
      duration: 800,
    });
  };

  // Recenter on Rider
  const handleRecenter = () => {
    if (mapRef.current) {
      mapRef.current.flyTo({
        center: currentRider,
        zoom: 15,
        pitch: is3D ? 45 : 0,
        bearing: is3D ? -12 : 0,
        essential: true,
      });
    }
  };

  // Smooth Route Movement Simulation (Dev/Demo Mode)
  const toggleSimulation = async () => {
    if (isSimulating) {
      setIsSimulating(false);
      return;
    }

    setIsSimulating(true);
    const { geometry } = await fetchRouteWithETA(currentRider, targetCoords);
    if (!geometry?.coordinates?.length) return;

    const coords = geometry.coordinates;
    let idx = 0;

    const interval = setInterval(() => {
      if (idx >= coords.length - 1 || !mapRef.current) {
        clearInterval(interval);
        setIsSimulating(false);
        return;
      }
      idx += 1;
      const [lng, lat] = coords[idx];
      if (riderMarkerRef.current) {
        riderMarkerRef.current.setLngLat([lng, lat]);
      }
      if (mapRef.current) {
        mapRef.current.panTo([lng, lat], { duration: 400 });
      }
    }, 500);
  };

  return (
    <div className="rider-map-wrapper">
      <div ref={mapContainerRef} className="maplibre-container" />

      {/* Top HUD Navigation Banner */}
      <div className="map-hud-top">
        <div className="hud-maneuver-card">
          <div className="maneuver-icon-badge">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
              <path d="M12 2L4.5 20.29l.71.71L12 18l6.79 3 .71-.71z" />
            </svg>
          </div>
          <div className="maneuver-text-wrap">
            <span className="maneuver-action">
              {isPickedUp ? "Deliver to Customer" : "Pickup from Feasto Kitchen"}
            </span>
            <span className="maneuver-sub">Hill Road • Fast Route Active</span>
          </div>
        </div>

        <div className="hud-speedometer-badge">
          <span className="speed-dot-pulse" />
          <span>32 km/h</span>
        </div>
      </div>

      {/* Bottom ETA & Distance Pill */}
      <div className="map-hud-bottom">
        <div className="hud-eta-pill">
          <span>⚡ {etaInfo.distanceKm || 2.4} km</span>
          <span style={{ color: "var(--border)" }}>•</span>
          <span className="eta-time-val">~{etaInfo.etaMinutes || 8} mins</span>
        </div>
      </div>

      {/* Floating Control Dock */}
      <div className="map-controls-dock">
        <button
          className="map-control-btn"
          onClick={handleRecenter}
          title="Recenter on My GPS Location"
        >
          <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
            <path d="M12 8c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4zm8.94 3c-.46-4.17-3.77-7.48-7.94-7.94V1h-2v2.06C6.83 3.52 3.52 6.83 3.06 11H1v2h2.06c.46 4.17 3.77 7.48 7.94 7.94V23h2v-2.06c4.17-.46 7.48-3.77 7.94-7.94H23v-2h-2.06zM12 19c-3.87 0-7-3.13-7-7s3.13-7 7-7 7 3.13 7 7-3.13 7-7 7z" />
          </svg>
        </button>

        <button
          className="map-control-btn"
          onClick={togglePerspective}
          title={`Switch to ${is3D ? "2D Flat" : "3D Isometric"} View`}
        >
          <span style={{ fontSize: "11px", fontWeight: "900" }}>{is3D ? "3D" : "2D"}</span>
        </button>

        <button
          className={`map-control-btn ${isSimulating ? "active-sim" : ""}`}
          onClick={toggleSimulation}
          title={isSimulating ? "Stop GPS Simulation" : "Simulate Live Route Movement"}
        >
          <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
            <path d="M19 7c0-1.1-.9-2-2-2h-3v2h3v2.65L13.52 14H10V9H6c-2.21 0-4 1.79-4 4v3h2c0 1.66 1.34 3 3 3s3-1.34 3-3h4.18c.41 0 .8-.17 1.08-.47L19 12.35V7z" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default RiderMap;
