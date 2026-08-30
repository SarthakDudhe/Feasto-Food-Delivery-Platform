import React from "react";
import { useRider } from "../../context/RiderContext";
import "./Earnings.css";

const Earnings = () => {
  const { rider, assignedOrders } = useRider();

  const totalEarned = rider?.earnings?.totalEarned || 0;
  const cashCollected = rider?.earnings?.cashCollected || 0;
  const pendingPayout = rider?.earnings?.pendingPayout || 0;

  const completedOrders = (assignedOrders || []).filter(
    (o) => o.status === "Delivered"
  );

  return (
    <div className="earnings-container">
      <div className="earnings-hero-card">
        <div>
          <div className="hero-label">Total Delivery Earnings</div>
          <div className="hero-amount">${totalEarned.toFixed(2)}</div>
        </div>

        <div className="wallet-sub-row">
          <div className="wallet-sub-col">
            <span style={{ fontSize: "11px", opacity: 0.8 }}>Cash in Hand (COD)</span>
            <span style={{ fontSize: "16px", fontWeight: "800" }}>
              ${cashCollected.toFixed(2)}
            </span>
          </div>
          <div className="wallet-sub-col" style={{ textAlign: "right" }}>
            <span style={{ fontSize: "11px", opacity: 0.8 }}>Pending Settlement</span>
            <span style={{ fontSize: "16px", fontWeight: "800" }}>
              ${pendingPayout.toFixed(2)}
            </span>
          </div>
        </div>
      </div>

      <div>
        <h3 style={{ fontSize: "16px", fontWeight: "700", marginBottom: "12px" }}>
          Completed Trip History ({completedOrders.length})
        </h3>

        {completedOrders.length === 0 ? (
          <div
            style={{
              padding: "30px 20px",
              textAlign: "center",
              color: "var(--text-muted)",
              background: "var(--bg-surface)",
              borderRadius: "var(--radius-md)",
            }}
          >
            No completed trips yet. Complete deliveries to see your trip payouts here!
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {completedOrders.map((order) => {
              const tripPayout = Math.max(3.5, Math.round(order.amount * 0.15 * 10) / 10);
              return (
                <div key={order._id} className="history-card">
                  <div>
                    <div className="history-title">
                      {order.address?.firstName} {order.address?.lastName}
                    </div>
                    <div className="history-date">
                      {order.date ? new Date(order.date).toLocaleDateString() : "Recent"} •{" "}
                      {order.items?.length || 1} items
                    </div>
                  </div>
                  <div className="history-payout">+${tripPayout.toFixed(2)}</div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Earnings;
