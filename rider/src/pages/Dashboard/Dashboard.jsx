import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import { useRider } from "../../context/RiderContext";
import IncomingOrderModal from "../../components/IncomingOrderModal/IncomingOrderModal";
import "./Dashboard.css";

const Dashboard = () => {
  const {
    backendUrl,
    rider,
    isOnDuty,
    toggleDuty,
    activeDelivery,
    setActiveDelivery,
    availableOrders,
    assignedOrders,
    fetchOrders,
    loadingOrders,
  } = useRider();

  const [simulatedDispatch, setSimulatedDispatch] = useState(null);
  const navigate = useNavigate();

  // Accept an order
  const handleAcceptOrder = async (order) => {
    try {
      const res = await axios.post(`${backendUrl}/api/order/assign`, {
        orderId: order._id,
        riderId: rider._id,
        riderName: rider.name,
        riderPhone: rider.phone,
      });

      if (res.data.success) {
        toast.success("Order accepted! Proceed to pickup 🛵");
        setActiveDelivery(order);
        setSimulatedDispatch(null);
        fetchOrders();
        navigate("/active-trip");
      } else {
        toast.error(res.data.message || "Could not accept order");
      }
    } catch (err) {
      toast.error("Failed to accept dispatch");
    }
  };

  const handleDeclineOrder = (orderId) => {
    setSimulatedDispatch(null);
    toast.info("Order offer declined");
  };

  const completedTripsToday = (assignedOrders || []).filter(
    (o) => o.status === "Delivered"
  ).length;

  const totalEarned = rider?.earnings?.totalEarned || 0;
  const rating = rider?.averageRating || 5.0;

  return (
    <div className="dashboard-container">
      {/* Duty Status Banner */}
      <div className={`duty-status-banner ${isOnDuty ? "online" : "offline"}`}>
        <div className="duty-banner-left">
          <div className="status-icon-wrapper">
            <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14H9v-2h2v2zm0-4H9V7h2v5z" />
            </svg>
          </div>
          <div>
            <div className="duty-banner-title">
              {isOnDuty ? "You are Online & Receiving Orders" : "You are Currently Offline"}
            </div>
            <div className="duty-banner-subtitle">
              {isOnDuty ? "GPS telemetry active. Ready for dispatch." : "Switch duty to Online to receive deliveries."}
            </div>
          </div>
        </div>
      </div>

      {/* Metrics Summary */}
      <div className="stats-grid">
        <div className="stat-card">
          <span className="stat-val earnings">${totalEarned.toFixed(2)}</span>
          <span className="stat-title">Total Earned</span>
        </div>
        <div className="stat-card">
          <span className="stat-val">{completedTripsToday}</span>
          <span className="stat-title">Trips Done</span>
        </div>
        <div className="stat-card">
          <span className="stat-val rating">★ {Number(rating).toFixed(1)}</span>
          <span className="stat-title">Rating</span>
        </div>
      </div>

      {/* Active Delivery Quick Jump Banner */}
      {activeDelivery && (
        <div>
          <div className="section-header">
            <h3 className="section-title">Ongoing Delivery</h3>
          </div>
          <div className="active-trip-card" onClick={() => navigate("/active-trip")}>
            <div className="active-trip-header">
              <span className="active-pill">
                <span className="duty-indicator" style={{ background: "#f59e0b" }}></span>
                IN TRANSIT
              </span>
              <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>
                Order #{activeDelivery._id?.slice(-5)}
              </span>
            </div>
            <div>
              <div style={{ fontWeight: "700", fontSize: "16px", marginBottom: "4px" }}>
                {activeDelivery.address?.firstName} {activeDelivery.address?.lastName}
              </div>
              <div style={{ fontSize: "13px", color: "var(--text-muted)" }}>
                {activeDelivery.address?.street}, {activeDelivery.address?.city}
              </div>
            </div>
            <button className="active-trip-btn">
              <span>Open Turn-by-Turn Navigation Map</span>
              <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                <path d="M5 13h11.86l-5.43 5.43 1.42 1.42L21.14 12l-8.29-7.85-1.42 1.42L16.86 11H5v2z" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Available Dispatches Queue */}
      <div>
        <div className="section-header">
          <h3 className="section-title">Available Dispatches Nearby</h3>
          <button className="refresh-btn" onClick={fetchOrders}>
            <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
              <path d="M17.65 6.35C16.2 4.9 14.21 4 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z" />
            </svg>
            Refresh
          </button>
        </div>

        {!isOnDuty ? (
          <div className="empty-state">
            <p>Go <strong>Online</strong> to see active dispatches in your area.</p>
            <button
              style={{
                background: "var(--brand-gradient)",
                color: "#fff",
                padding: "10px 20px",
                borderRadius: "var(--radius-sm)",
                fontWeight: "700",
              }}
              onClick={toggleDuty}
            >
              Go Online Now
            </button>
          </div>
        ) : loadingOrders ? (
          <div className="empty-state">Looking for live orders...</div>
        ) : availableOrders.length === 0 ? (
          <div className="empty-state">
            <svg viewBox="0 0 24 24" width="36" height="36" fill="currentColor">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z" />
            </svg>
            <p>No new dispatches right now. You will be alerted automatically when an order is placed!</p>
          </div>
        ) : (
          <div className="orders-list">
            {availableOrders.map((order) => (
              <div key={order._id} className="order-dispatch-card">
                <div className="order-dispatch-header">
                  <div className="order-customer-name">
                    {order.address?.firstName} {order.address?.lastName}
                  </div>
                  <div className="order-price">${order.amount?.toFixed(2)}</div>
                </div>
                <div className="order-dispatch-address">
                  <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" style={{ flexShrink: 0 }}>
                    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
                  </svg>
                  <span>{order.address?.street}, {order.address?.city}</span>
                </div>
                <button
                  className="accept-dispatch-btn"
                  onClick={() => setSimulatedDispatch(order)}
                >
                  View & Accept Dispatch (${Math.max(3.5, (order.amount * 0.15)).toFixed(2)} Earning)
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Incoming Modal popup */}
      {simulatedDispatch && (
        <IncomingOrderModal
          order={simulatedDispatch}
          onAccept={handleAcceptOrder}
          onDecline={handleDeclineOrder}
        />
      )}
    </div>
  );
};

export default Dashboard;
