import { createContext, useContext, useState, useEffect, useRef } from "react";
import axios from "axios";
import { io } from "socket.io-client";
import { toast } from "react-toastify";

const RiderContext = createContext();

export const RiderProvider = ({ children }) => {
  const backendUrl = "http://localhost:4000";
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

  const socketRef = useRef(null);
  const watchIdRef = useRef(null);

  // Initialize Socket.io
  useEffect(() => {
    socketRef.current = io(backendUrl);

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

        // Find current ongoing active delivery (not yet delivered or cancelled)
        const currentActive = (response.data.assigned || []).find(
          (o) => o.status !== "Delivered" && o.status !== "Cancelled"
        );
        setActiveDelivery(currentActive || null);
      }
      // Also refresh profile & earnings balance
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

  // Real-time GPS Broadcaster
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
          setCurrentLocation({ lat: latitude, lng: longitude });

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
            // silent catch for background location pings
          }
        },
        (error) => {
          console.warn("Geolocation watch error (using default location):", error.message);
        },
        { enableHighAccuracy: true, maximumAge: 5000, timeout: 10000 }
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
        toast.info(`Duty status changed to: ${response.data.isOnDuty ? "Online 🟢" : "Offline ⚪"}`);
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

  // Login handler
  const login = (tokenData, riderData) => {
    setToken(tokenData);
    setRider(riderData);
    localStorage.setItem("riderToken", tokenData);
    localStorage.setItem("riderUser", JSON.stringify(riderData));
    fetchRiderProfile(riderData._id);
  };

  // Logout handler
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
        socket: socketRef.current,
      }}
    >
      {children}
    </RiderContext.Provider>
  );
};

export const useRider = () => useContext(RiderContext);
