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
  const [activeTab, setActiveTab] = useState("available"); // "available" or "assigned"
  const navigate = useNavigate();

  const activeAssignedOrders = (assignedOrders || []).filter(
    (o) => o.status !== "Delivered" && o.status !== "Cancelled"
  );

  const displayList = activeTab === "available" ? availableOrders : activeAssignedOrders;

  const handleAcceptOrder = async (order) => {
    try {
      const res = await axios.post(`${backendUrl}/api/order/assign`, {
        orderId: order._id,
        riderId: rider._id,
        riderName: rider.name,
        riderPhone: rider.phone,
      });

      if (res.data.success) {
        toast.success("Order accepted! Navigate to pickup 🛵");
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

  const handleDeclineOrder = () => {
    setSimulatedDispatch(null);
    toast.info("Order offer declined");
  };

  const completedTrips = (assignedOrders || []).filter(
    (o) => o.status === "Delivered"
  );

  const computedEarnings = completedTrips.reduce((sum, order) => {
    return sum + Math.max(3.5, Math.round(order.amount * 0.15 * 10) / 10);
  }, 0);

  const totalEarned = Math.max(rider?.earnings?.totalEarned || 0, computedEarnings);
  const rating = rider?.averageRating || 5.0;

  return (
    <div className="rider-app-shell">
      {/* Feasto Page Intro Banner */}
      <div className="page-intro">
        <span className="page-intro-eyebrow">PARTNER DISPATCH CONSOLE</span>
        <h1>Welcome back, {rider?.name || "Captain"}! 🚀</h1>
        <p>
          Manage active deliveries, review incoming dispatches, and track daily trip earnings in real-time.
        </p>
      </div>

      {/* 4-Card Summary Metrics */}
      <div className="dashboard-metrics-grid">
        <div className="metric-card">
          <div className="metric-header">
            <span className="metric-title">Total Earned</span>
            <div className="metric-icon-wrap">
              <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                <path d="M21 18v1c0 1.1-.9 2-2 2H5c-1.11 0-2-.9-2-2V5c0-1.1.89-2 2-2h14c1.1 0 2 .9 2 2v1h-9c-1.11 0-2 .9-2 2v8c0 1.1.89 2 2 2h9zm-9-2h10V8H12v8zm4-2.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z" />
              </svg>
            </div>
          </div>
          <span className="metric-value earnings">${totalEarned.toFixed(2)}</span>
          <span className="metric-subtext">Lifetime delivery payouts</span>
        </div>

        <div className="metric-card">
          <div className="metric-header">
            <span className="metric-title">Trips Completed</span>
            <div className="metric-icon-wrap">
              <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                <path d="M19 7c0-1.1-.9-2-2-2h-3v2h3v2.65L13.52 14H10V9H6c-2.21 0-4 1.79-4 4v3h2c0 1.66 1.34 3 3 3s3-1.34 3-3h4.18c.41 0 .8-.17 1.08-.47L19 12.35V7z" />
              </svg>
            </div>
          </div>
          <span className="metric-value">{completedTrips.length}</span>
          <span className="metric-subtext">Verified dropoffs</span>
        </div>

        <div className="metric-card">
          <div className="metric-header">
            <span className="metric-title">Partner Rating</span>
            <div className="metric-icon-wrap" style={{ color: "#d97706" }}>
              <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
              </svg>
            </div>
          </div>
          <span className="metric-value rating">★ {Number(rating).toFixed(1)}</span>
          <span className="metric-subtext">{rider?.totalRatings || 0} customer ratings</span>
        </div>

        <div className="metric-card">
          <div className="metric-header">
            <span className="metric-title">Duty Telemetry</span>
            <div className="metric-icon-wrap" style={{ color: isOnDuty ? "#16a34a" : "#64748b" }}>
              <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14H9v-2h2v2zm0-4H9V7h2v5z" />
              </svg>
            </div>
          </div>
          <span className="metric-value" style={{ color: isOnDuty ? "#16a34a" : "#64748b", fontSize: "22px" }}>
            {isOnDuty ? "Online 🟢" : "Offline ⚪"}
          </span>
          <span className="metric-subtext">{isOnDuty ? "GPS stream active" : "Telemetry paused"}</span>
        </div>
      </div>

      {/* 2-Column Responsive Workspace Grid */}
      <div className="dashboard-grid-layout">
        {/* Left Column: Dispatches Feed */}
        <section className="dispatches-section">
          <div className="section-title-bar">
            {/* Tabs Bar */}
            <div className="dashboard-tabs-bar">
              <button
                className={`dashboard-tab-btn ${activeTab === "available" ? "active" : ""}`}
                onClick={() => setActiveTab("available")}
              >
                <span>Available Dispatches</span>
                <span className="tab-badge">{availableOrders.length}</span>
              </button>
              <button
                className={`dashboard-tab-btn ${activeTab === "assigned" ? "active" : ""}`}
                onClick={() => setActiveTab("assigned")}
              >
                <span>My Assigned Orders</span>
                <span className="tab-badge">{activeAssignedOrders.length}</span>
              </button>
            </div>

            <button className="refresh-action-btn" onClick={fetchOrders}>
              <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                <path d="M17.65 6.35C16.2 4.9 14.21 4 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z" />
              </svg>
              <span>Refresh</span>
            </button>
          </div>

          {!isOnDuty ? (
            <div className="empty-dispatches-box">
              <svg viewBox="0 0 24 24" width="44" height="44" fill="#d97706">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
              </svg>
              <h3 style={{ fontSize: "16px", color: "var(--text)" }}>You are currently Offline</h3>
              <p style={{ maxWidth: "420px", fontSize: "14px" }}>
                Switch your duty status to <strong>Online</strong> to start receiving real-time restaurant pickups and live order dispatches.
              </p>
              <button
                className="claim-dispatch-btn"
                style={{ marginTop: "6px" }}
                onClick={toggleDuty}
              >
                Go Online Now
              </button>
            </div>
          ) : loadingOrders ? (
            <div className="empty-dispatches-box">
              <p>Scanning area for live orders...</p>
            </div>
          ) : displayList.length === 0 ? (
            <div className="empty-dispatches-box">
              <svg viewBox="0 0 24 24" width="44" height="44" fill="#94a3b8">
                <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z" />
              </svg>
              <h3 style={{ fontSize: "16px", color: "var(--text)" }}>
                {activeTab === "available" ? "No Dispatches In Queue" : "No Assigned Tasks"}
              </h3>
              <p style={{ maxWidth: "420px", fontSize: "14px" }}>
                {activeTab === "available"
                  ? "All nearby orders are assigned. You will be notified automatically when an order is placed!"
                  : "You do not have any pending assigned orders. Claim an available dispatch to begin."}
              </p>
            </div>
          ) : (
            <div className="dispatches-stack">
              {displayList.map((order) => {
                const tripPayout = Math.max(3.5, Math.round(order.amount * 0.15 * 10) / 10);
                const isAssignedToMe = order.riderId === rider?._id;

                return (
                  <div key={order._id} className="dispatch-item-card">
                    <div className="dispatch-card-top">
                      <div>
                        <h3 className="customer-name-heading">
                          {order.address?.firstName} {order.address?.lastName}
                        </h3>
                        <span className="order-items-badge">
                          Order #{order._id?.slice(-6)} • {order.items?.length || 1} items to pick up • Status: {order.status}
                        </span>
                      </div>
                      <span className="payout-pill">+${tripPayout.toFixed(2)} Earning</span>
                    </div>

                    <div className="dispatch-address-row">
                      <svg viewBox="0 0 24 24" width="18" height="18" fill="var(--accent)">
                        <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
                      </svg>
                      <span>{order.address?.street}, {order.address?.city}</span>
                    </div>

                    {isAssignedToMe ? (
                      <button
                        className="claim-dispatch-btn"
                        onClick={() => {
                          setActiveDelivery(order);
                          navigate("/active-trip");
                        }}
                      >
                        <span>Open Active Trip Map</span>
                        <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                          <path d="M5 13h11.86l-5.43 5.43 1.42 1.42L21.14 12l-8.29-7.85-1.42 1.42L16.86 11H5v2z" />
                        </svg>
                      </button>
                    ) : (
                      <button
                        className="claim-dispatch-btn"
                        onClick={() => setSimulatedDispatch(order)}
                      >
                        <span>Review & Accept Dispatch</span>
                        <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                          <path d="M5 13h11.86l-5.43 5.43 1.42 1.42L21.14 12l-8.29-7.85-1.42 1.42L16.86 11H5v2z" />
                        </svg>
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* Right Column: Active Trip & Quick Tools */}
        <aside className="dashboard-sidebar-column">
          {activeDelivery ? (
            <div className="active-trip-widget">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span className="active-widget-tag">
                  ● ACTIVE TRIP IN TRANSIT
                </span>
                <span style={{ fontSize: "12px", color: "var(--muted)", fontWeight: "700" }}>
                  #{activeDelivery._id?.slice(-5)}
                </span>
              </div>

              <div>
                <h3 style={{ fontSize: "18px", fontWeight: "800", color: "var(--text)" }}>
                  {activeDelivery.address?.firstName} {activeDelivery.address?.lastName}
                </h3>
                <p style={{ fontSize: "13px", color: "var(--muted)", marginTop: "2px" }}>
                  {activeDelivery.address?.street}, {activeDelivery.address?.city}
                </p>
              </div>

              <button className="open-trip-btn" onClick={() => navigate("/active-trip")}>
                <span>Open Navigation Map</span>
                <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                  <path d="M5 13h11.86l-5.43 5.43 1.42 1.42L21.14 12l-8.29-7.85-1.42 1.42L16.86 11H5v2z" />
                </svg>
              </button>
            </div>
          ) : (
            <div className="feasto-card" style={{ textAlign: "center", padding: "30px 20px" }}>
              <div style={{ width: "48px", height: "48px", borderRadius: "50%", background: "var(--surface-soft)", color: "var(--accent)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 12px" }}>
                <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
                  <path d="M19 7c0-1.1-.9-2-2-2h-3v2h3v2.65L13.52 14H10V9H6c-2.21 0-4 1.79-4 4v3h2c0 1.66 1.34 3 3 3s3-1.34 3-3h4.18c.41 0 .8-.17 1.08-.47L19 12.35V7z" />
                </svg>
              </div>
              <h3 style={{ fontSize: "16px", fontWeight: "800" }}>Ready for Delivery</h3>
              <p style={{ fontSize: "13px", color: "var(--muted)", marginTop: "4px" }}>
                No delivery currently in progress. Select a dispatch from the left to start.
              </p>
            </div>
          )}

          {/* Quick Tools Box */}
          <div className="quick-tools-card">
            <h3 style={{ fontSize: "15px", fontWeight: "800" }}>Quick Partner Tools</h3>
            <button className="quick-tool-btn" onClick={() => navigate("/earnings")}>
              <span>View Wallet & Earnings</span>
              <span>→</span>
            </button>
            <button className="quick-tool-btn" onClick={() => navigate("/profile")}>
              <span>KYC & Vehicle Profile</span>
              <span>→</span>
            </button>
            <button className="quick-tool-btn" onClick={toggleDuty}>
              <span>Switch Duty to {isOnDuty ? "Offline" : "Online"}</span>
              <span>{isOnDuty ? "⚪" : "🟢"}</span>
            </button>
          </div>
        </aside>
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
