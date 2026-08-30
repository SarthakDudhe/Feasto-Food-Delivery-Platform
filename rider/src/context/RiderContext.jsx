import { createContext, useContext, useState, useEffect, useRef } from "react";
import axios from "axios";
import { io } from "socket.io-client";
import { toast } from "react-toastify";

const RiderContext = createContext();

// Haversine formula to compute distance in meters between two GPS coordinates
function getDistanceMeters(lat1, lon1, lat2, lon2) {
  const R = 6371e3;
  const p1 = (lat1 * Math.PI) / 180;
  const p2 = (lat2 * Math.PI) / 180;
  const dp = ((lat2 - lat1) * Math.PI) / 180;
  const dl = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(dp / 2) * Math.sin(dp / 2) +
    Math.cos(p1) * Math.cos(p2) * Math.sin(dl / 2) * Math.sin(dl / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export const RiderProvider = ({ children }) => {
  const backendUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:4000";
  const [token, setToken] = useState(localStorage.getItem("riderToken") || "");
  const [rider, setRider] = useState(
    JSON.parse(localStorage.getItem("riderUser") || "null")
  );
  const [isOnDuty, setIsOnDuty] = useState(false);
  const [currentLocation, setCurrentLocation] = useState({ lat: 28.6139, lng: 77.2090 });
  const [assignedOrders, setAssignedOrders] = useState([]);
  const [availableOrders, setAvailableOrders] = useState([]);
  const [activeDelivery, setActiveDelivery] = useState(null);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [isOnlineNetwork, setIsOnlineNetwork] = useState(navigator.onLine);

  const socketRef = useRef(null);
  const watchIdRef = useRef(null);
  const lastBroadcastRef = useRef({ lat: 0, lng: 0, time: 0 });

  // Network Connectivity Event Listeners
  useEffect(() => {
    const handleOnline = () => {
      setIsOnlineNetwork(true);
      toast.success("Network connection restored 🌐");
      if (token && rider?._id) fetchOrders();
    };

    const handleOffline = () => {
      setIsOnlineNetwork(false);
      toast.warn("You are currently offline. Check cellular data 📶");
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, [token, rider?._id]);

  // Initialize Socket.io
  useEffect(() => {
    socketRef.current = io(backendUrl, {
      reconnectionAttempts: 10,
      reconnectionDelay: 2000,
    });

    socketRef.current.on("connect", () => {
      console.log("Rider Connected to Socket:", socketRef.current.id);
    });

    return () => {
      if (socketRef.current) socketRef.current.disconnect();
    };
  }, []);

  // Fetch full rider profile on mount or token change
  const fetchRiderProfile = async (riderId) => {
    try {
      const targetId = riderId || (rider ? rider._id : null);
      if (!targetId) return;

      const response = await axios.post(`${backendUrl}/api/rider/profile`, { riderId: targetId });
      if (response.data.success) {
        setRider(response.data.data);
        setIsOnDuty(response.data.data.isOnDuty ?? true);
        if (response.data.data.currentLocation?.lat) {
          setCurrentLocation({
            lat: response.data.data.currentLocation.lat,
            lng: response.data.data.currentLocation.lng,
          });
        }
        localStorage.setItem("riderUser", JSON.stringify(response.data.data));
      }
    } catch (error) {
      console.error("Error fetching rider profile:", error);
    }
  };

  // Fetch rider orders (assigned + available) and refresh balance
  const fetchOrders = async () => {
    if (!rider?._id) return;
    setLoadingOrders(true);
    try {
      const response = await axios.post(`${backendUrl}/api/rider/orders`, { riderId: rider._id });
      if (response.data.success) {
        setAssignedOrders(response.data.assigned || []);
        setAvailableOrders(response.data.available || []);

        const currentActive = (response.data.assigned || []).find(
          (o) => o.status !== "Delivered" && o.status !== "Cancelled"
        );
        setActiveDelivery(currentActive || null);
      }
      fetchRiderProfile(rider._id);
    } catch (error) {
      console.error("Error fetching rider orders:", error);
    } finally {
      setLoadingOrders(false);
    }
  };

  useEffect(() => {
    if (token && rider?._id) {
      fetchRiderProfile(rider._id);
      fetchOrders();
    }
  }, [token]);

  // Battery & Cellular Throttled GPS Broadcaster
  useEffect(() => {
    if (!isOnDuty || !rider?._id) {
      if (watchIdRef.current) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
      return;
    }

    if ("geolocation" in navigator) {
      watchIdRef.current = navigator.geolocation.watchPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          const now = Date.now();
          const last = lastBroadcastRef.current;

          const distMoved = getDistanceMeters(last.lat, last.lng, latitude, longitude);
          const timeElapsed = now - last.time;

          // Always update local React state for smooth map pin
          setCurrentLocation({ lat: latitude, lng: longitude });

          // Throttle network pings: only send if moved > 15m or > 5 seconds elapsed
          if (distMoved < 15 && timeElapsed < 5000) {
            return; // Battery & data saver: skip redundant broadcast
          }

          lastBroadcastRef.current = { lat: latitude, lng: longitude, time: now };

          // Broadcast through Socket.io
          if (socketRef.current) {
            socketRef.current.emit("rider_location_broadcast", {
              riderId: rider._id,
              orderId: activeDelivery ? activeDelivery._id : null,
              lat: latitude,
              lng: longitude,
            });
          }

          // Periodic server sync
          try {
            await axios.post(`${backendUrl}/api/rider/update-gps`, {
              riderId: rider._id,
              lat: latitude,
              lng: longitude,
            });
          } catch (e) {
            // silent catch
          }
        },
        (error) => {
          console.warn("Geolocation watch warning:", error.message);
        },
        { enableHighAccuracy: true, maximumAge: 6000, timeout: 10000 }
      );
    }

    return () => {
      if (watchIdRef.current) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, [isOnDuty, rider?._id, activeDelivery?._id]);

  // Toggle On Duty / Off Duty
  const toggleDuty = async () => {
    if (!rider?._id) return;
    try {
      const response = await axios.post(`${backendUrl}/api/rider/toggle-duty`, {
        riderId: rider._id,
        isOnDuty: !isOnDuty,
      });

      if (response.data.success) {
        setIsOnDuty(response.data.isOnDuty);
        toast.info(`Duty status: ${response.data.isOnDuty ? "Online 🟢" : "Offline ⚪"}`);
        if (socketRef.current) {
          socketRef.current.emit("rider_duty_change", {
            riderId: rider._id,
            isOnDuty: response.data.isOnDuty,
          });
        }
      }
    } catch (error) {
      toast.error("Failed to update duty status");
    }
  };

  const login = (tokenData, riderData) => {
    setToken(tokenData);
    setRider(riderData);
    localStorage.setItem("riderToken", tokenData);
    localStorage.setItem("riderUser", JSON.stringify(riderData));
    fetchRiderProfile(riderData._id);
  };

  const logout = () => {
    setToken("");
    setRider(null);
    setActiveDelivery(null);
    localStorage.removeItem("riderToken");
    localStorage.removeItem("riderUser");
    toast.success("Logged out successfully");
  };

  return (
    <RiderContext.Provider
      value={{
        backendUrl,
        token,
        rider,
        isOnDuty,
        toggleDuty,
        currentLocation,
        setCurrentLocation,
        assignedOrders,
        availableOrders,
        activeDelivery,
        setActiveDelivery,
        loadingOrders,
        fetchOrders,
        fetchRiderProfile,
        login,
        logout,
        isOnlineNetwork,
        socket: socketRef.current,
      }}
    >
      {children}
    </RiderContext.Provider>
  );
};

export const useRider = () => useContext(RiderContext);
