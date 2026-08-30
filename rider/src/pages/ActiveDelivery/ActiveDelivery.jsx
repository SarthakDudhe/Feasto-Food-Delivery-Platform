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
    rider,
  } = useRider();

  const [deliveryOtp, setDeliveryOtp] = useState("");
  const [showChat, setShowChat] = useState(false);
  const [loadingAction, setLoadingAction] = useState(false);
  const navigate = useNavigate();

  if (!activeDelivery) {
    return (
      <div className="active-delivery-container" style={{ textAlign: "center", paddingTop: "60px" }}>
        <div style={{ color: "var(--text-muted)", marginBottom: "16px" }}>
          <svg viewBox="0 0 24 24" width="48" height="48" fill="currentColor">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm4.59-12.42L10 14.17l-2.59-2.58L6 13l4 4 8-8z" />
          </svg>
        </div>
        <h2>No Active Delivery In Progress</h2>
        <p style={{ color: "var(--text-muted)", margin: "8px 0 24px" }}>
          Accept an incoming dispatch from the Home feed to begin navigation.
        </p>
        <button
          className="step-action-btn"
          onClick={() => navigate("/")}
          style={{ maxWidth: "240px", margin: "0 auto" }}
        >
          Go to Dispatches
        </button>
      </div>
    );
  }

  const isPickedUp = activeDelivery.status === "Out for Delivery";

  // Progress to "Out for Delivery"
  const handlePickedUp = async () => {
    setLoadingAction(true);
    try {
      const res = await axios.post(`${backendUrl}/api/order/status`, {
        orderId: activeDelivery._id,
        status: "Out for Delivery",
      });

      if (res.data.success) {
        toast.success("Food picked up! Head to customer address 🛵");
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

  // Complete delivery with customer OTP
  const handleVerifyOtpAndDeliver = async (e) => {
    e.preventDefault();
    if (!deliveryOtp.trim()) {
      return toast.warn("Please enter the 4-digit OTP from the customer");
    }

    setLoadingAction(true);
    try {
      const res = await axios.post(`${backendUrl}/api/order/verify-delivery`, {
        orderId: activeDelivery._id,
        otp: deliveryOtp.trim(),
      });

      if (res.data.success) {
        toast.success("Delivery confirmed & completed! Great job! 🎉");
        setActiveDelivery(null);
        fetchOrders();
        navigate("/earnings");
      } else {
        toast.error(res.data.message || "Invalid OTP");
      }
    } catch (err) {
      toast.error("Error verifying delivery OTP");
    } finally {
      setLoadingAction(false);
    }
  };

  return (
    <div className="active-delivery-container">
      {/* Live Map */}
      <RiderMap
        riderCoords={currentLocation}
        customerCoords={null}
        isPickedUp={isPickedUp}
      />

      {/* Stepper */}
      <div className="step-tracker">
        <div className={`step-item completed`}>
          <div className="step-circle">✓</div>
          <span className="step-title">Accepted</span>
        </div>
        <div className={`step-item ${isPickedUp ? "completed" : "active"}`}>
          <div className="step-circle">{isPickedUp ? "✓" : "2"}</div>
          <span className="step-title">Pickup</span>
        </div>
        <div className={`step-item ${isPickedUp ? "active" : ""}`}>
          <div className="step-circle">3</div>
          <span className="step-title">Dropoff</span>
        </div>
      </div>

      {/* Delivery Info Card */}
      <div className="delivery-details-card">
        <div className="customer-quick-row">
          <div>
            <div style={{ fontSize: "16px", fontWeight: "700" }}>
              {activeDelivery.address?.firstName} {activeDelivery.address?.lastName}
            </div>
            <div style={{ fontSize: "13px", color: "var(--text-muted)" }}>
              {activeDelivery.address?.street}, {activeDelivery.address?.city}
            </div>
          </div>
          <div style={{ display: "flex", gap: "8px" }}>
            <button
              className="contact-action-btn"
              onClick={() => setShowChat(true)}
              title="Chat with customer"
            >
              💬 Chat
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

        {/* Customer Cooking / Gate Notes */}
        {activeDelivery.notes && (
          <div
            style={{
              padding: "10px 12px",
              background: "rgba(245, 158, 11, 0.1)",
              borderLeft: "3px solid #f59e0b",
              borderRadius: "4px",
              fontSize: "12px",
              color: "#fbbf24",
            }}
          >
            <strong>Customer Note:</strong> {activeDelivery.notes}
          </div>
        )}

        {/* Items Summary */}
        <div className="order-items-summary">
          <div style={{ fontWeight: "700", marginBottom: "6px" }}>
            Order Items ({activeDelivery.items?.length || 0})
          </div>
          {activeDelivery.items?.map((item, idx) => (
            <div
              key={idx}
              style={{
                display: "flex",
                justifyContent: "space-between",
                color: "var(--text-muted)",
              }}
            >
              <span>
                {item.quantity}x {item.name}
              </span>
              <span>${(item.price * item.quantity).toFixed(2)}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Action Area: Pickup vs Handover with OTP */}
      {!isPickedUp ? (
        <button
          className="step-action-btn"
          onClick={handlePickedUp}
          disabled={loadingAction}
        >
          {loadingAction ? "Updating..." : "Confirm Food Pickup from Restaurant 📦"}
        </button>
      ) : (
        <form onSubmit={handleVerifyOtpAndDeliver} className="otp-verification-card">
          <div style={{ fontWeight: "700", fontSize: "15px", color: "#10b981" }}>
            Customer Delivery Verification
          </div>
          <p style={{ fontSize: "12px", color: "var(--text-muted)" }}>
            Ask customer for their 4-digit handover OTP:
          </p>
          <div className="otp-input-group">
            <input
              type="text"
              maxLength="4"
              placeholder="••••"
              className="otp-digit-input"
              value={deliveryOtp}
              onChange={(e) => setDeliveryOtp(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="step-action-btn green" disabled={loadingAction}>
            {loadingAction ? "Verifying..." : "Verify OTP & Complete Delivery ✓"}
          </button>
        </form>
      )}

      {/* In-app Chat Modal */}
      {showChat && (
        <ChatModal order={activeDelivery} onClose={() => setShowChat(false)} />
      )}
    </div>
  );
};

export default ActiveDelivery;
