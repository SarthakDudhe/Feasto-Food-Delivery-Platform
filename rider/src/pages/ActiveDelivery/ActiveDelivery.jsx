import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import { useRider } from "../../context/RiderContext";
import RiderMap from "../../components/DeliveryMap/RiderMap";
import ChatModal from "../../components/ChatModal/ChatModal";
import "./ActiveDelivery.css";

const ActiveDelivery = () => {
  const {
    backendUrl,
    activeDelivery,
    setActiveDelivery,
    currentLocation,
    fetchOrders,
  } = useRider();

  const [deliveryOtp, setDeliveryOtp] = useState("");
  const [showChat, setShowChat] = useState(false);
  const [loadingAction, setLoadingAction] = useState(false);
  const navigate = useNavigate();

  if (!activeDelivery) {
    return (
      <div className="rider-app-shell">
        <div className="feasto-card" style={{ textAlign: "center", padding: "64px 20px" }}>
          <div
            style={{
              width: "64px",
              height: "64px",
              borderRadius: "50%",
              background: "var(--surface-soft)",
              color: "var(--accent-dark)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 16px",
            }}
          >
            <svg viewBox="0 0 24 24" width="32" height="32" fill="currentColor">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm4.59-12.42L10 14.17l-2.59-2.58L6 13l4 4 8-8z" />
            </svg>
          </div>
          <h2 style={{ fontSize: "24px", fontWeight: "800", color: "var(--text)" }}>
            No Active Delivery In Progress
          </h2>
          <p style={{ color: "var(--muted)", margin: "8px 0 24px", maxWidth: "420px", marginInline: "auto" }}>
            Accept an incoming delivery dispatch from your dashboard feed to open the turn-by-turn navigation map.
          </p>
          <button
            className="step-action-btn"
            onClick={() => navigate("/")}
            style={{ maxWidth: "260px", margin: "0 auto" }}
          >
            Go to Available Dispatches
          </button>
        </div>
      </div>
    );
  }

  const isPickedUp = activeDelivery.status === "Out for Delivery";

  const handlePickedUp = async () => {
    setLoadingAction(true);
    try {
      const res = await axios.post(`${backendUrl}/api/order/status`, {
        orderId: activeDelivery._id,
        status: "Out for Delivery",
      });

      if (res.data.success) {
        toast.success("Food picked up! Head to customer dropoff address 🛵");
        setActiveDelivery({ ...activeDelivery, status: "Out for Delivery" });
        fetchOrders();
      } else {
        toast.error("Failed to update status");
      }
    } catch (err) {
      toast.error("Error updating pickup status");
    } finally {
      setLoadingAction(false);
    }
  };

  const handleVerifyOtpAndDeliver = async (e) => {
    e.preventDefault();
    if (!deliveryOtp.trim()) {
      return toast.warn("Please enter the 4-digit handover OTP from the customer");
    }

    setLoadingAction(true);
    try {
      const res = await axios.post(`${backendUrl}/api/order/verify-delivery`, {
        orderId: activeDelivery._id,
        otp: deliveryOtp.trim(),
      });

      if (res.data.success) {
        toast.success("Delivery confirmed & verified! Payout credited! 🎉");
        setActiveDelivery(null);
        fetchOrders();
        navigate("/earnings");
      } else {
        toast.error(res.data.message || "Invalid OTP entered");
      }
    } catch (err) {
      toast.error("Error verifying delivery OTP");
    } finally {
      setLoadingAction(false);
    }
  };

  return (
    <div className="rider-app-shell">
      {/* Feasto Page Intro Banner */}
      <div className="page-intro">
        <span className="page-intro-eyebrow">LIVE TRIP NAVIGATION</span>
        <h1>Active Delivery #{activeDelivery._id?.slice(-6)}</h1>
        <p>
          Follow the turn-by-turn route, coordinate arrival with the customer, and verify the handover OTP.
        </p>
      </div>

      {/* 50/50 Split Screen Layout */}
      <div className="active-delivery-split-layout">
        {/* Left Column: Delivery Steps & Handover */}
        <div className="delivery-control-column">
          {/* Stepper Card */}
          <div className="stepper-card">
            <div className="step-tracker">
              <div className="step-item completed">
                <div className="step-circle">✓</div>
                <span className="step-title">Accepted</span>
              </div>
              <div className={`step-item ${isPickedUp ? "completed" : "active"}`}>
                <div className="step-circle">{isPickedUp ? "✓" : "2"}</div>
                <span className="step-title">Kitchen Pickup</span>
              </div>
              <div className={`step-item ${isPickedUp ? "active" : ""}`}>
                <div className="step-circle">3</div>
                <span className="step-title">Customer Handover</span>
              </div>
            </div>
          </div>

          {/* Details Card */}
          <div className="delivery-details-card">
            <div className="customer-quick-row">
              <div>
                <div className="customer-name-large">
                  {activeDelivery.address?.firstName} {activeDelivery.address?.lastName}
                </div>
                <div className="customer-street-sub">
                  {activeDelivery.address?.street}, {activeDelivery.address?.city}
                </div>
              </div>
              <div style={{ display: "flex", gap: "8px" }}>
                <button
                  className="contact-action-btn"
                  onClick={() => setShowChat(true)}
                  title="Open live chat"
                >
                  💬 In-App Chat
                </button>
                {activeDelivery.address?.phone && (
                  <a
                    href={`tel:${activeDelivery.address.phone}`}
                    className="contact-action-btn"
                  >
                    📞 Call
                  </a>
                )}
              </div>
            </div>

            {/* Cooking / Delivery Instructions */}
            {activeDelivery.notes && (
              <div className="cooking-instructions-box">
                <strong>Customer Instructions:</strong> {activeDelivery.notes}
              </div>
            )}

            {/* Order Items Checklist */}
            <div className="order-items-summary">
              <div className="items-heading">
                Dishes to Deliver ({activeDelivery.items?.length || 0} items)
              </div>
              {activeDelivery.items?.map((item, idx) => (
                <div key={idx} className="item-line-row">
                  <span>
                    <strong>{item.quantity}x</strong> {item.name}
                  </span>
                  <span>${(item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Action Step: Pickup vs Customer OTP Handover */}
          {!isPickedUp ? (
            <button
              className="step-action-btn"
              onClick={handlePickedUp}
              disabled={loadingAction}
            >
              {loadingAction ? "Updating..." : "Confirm Food Pickup from Kitchen 📦"}
            </button>
          ) : (
            <form onSubmit={handleVerifyOtpAndDeliver} className="otp-verification-card">
              <div style={{ fontWeight: "800", fontSize: "16px", color: "var(--success)" }}>
                Verify Customer Delivery OTP
              </div>
              <p style={{ fontSize: "13px", color: "var(--muted)" }}>
                Ask the customer for their unique 4-digit code to finalize the trip:
              </p>
              <input
                type="text"
                maxLength="4"
                placeholder="••••"
                className="otp-digit-input"
                value={deliveryOtp}
                onChange={(e) => setDeliveryOtp(e.target.value)}
                required
              />
              <button type="submit" className="step-action-btn green" disabled={loadingAction}>
                {loadingAction ? "Verifying Handover..." : "Verify OTP & Complete Delivery ✓"}
              </button>
            </form>
          )}
        </div>

        {/* Right Column: Full-Height MapLibre Map */}
        <div className="map-column-sticky">
          <RiderMap
            riderCoords={currentLocation}
            customerCoords={null}
            isPickedUp={isPickedUp}
          />
        </div>
      </div>

      {/* In-App Chat Modal */}
      {showChat && (
        <ChatModal order={activeDelivery} onClose={() => setShowChat(false)} />
      )}
    </div>
  );
};

export default ActiveDelivery;
