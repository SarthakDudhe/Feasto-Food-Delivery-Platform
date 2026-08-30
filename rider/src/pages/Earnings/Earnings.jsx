import React from "react";
import { useRider } from "../../context/RiderContext";
import "./Earnings.css";

const Earnings = () => {
  const { rider, assignedOrders } = useRider();

  const completedOrders = (assignedOrders || []).filter(
    (o) => o.status === "Delivered"
  );

  // Compute calculated commission from delivered trips
  const computedEarnings = completedOrders.reduce((sum, order) => {
    return sum + Math.max(3.5, Math.round(order.amount * 0.15 * 10) / 10);
  }, 0);

  const totalEarned = Math.max(rider?.earnings?.totalEarned || 0, computedEarnings);
  const cashCollected = rider?.earnings?.cashCollected || 0;
  const pendingPayout = rider?.earnings?.pendingPayout || totalEarned;

  return (
    <div className="rider-app-shell">
      {/* Feasto Page Intro Banner */}
      <div className="page-intro">
        <span className="page-intro-eyebrow">PARTNER WALLET & PAYOUTS</span>
        <h1>Earnings & Trip Settlement</h1>
        <p>
          Monitor your lifetime delivery commissions, cash collected in hand, and verified trip settlements.
        </p>
      </div>

      {/* 2-Column Responsive Layout */}
      <div className="earnings-layout-grid">
        {/* Left Column: Wallet Balance Card */}
        <aside style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          <div className="wallet-hero-card">
            <div className="wallet-hero-top">
              <span className="wallet-label">Total Delivery Earnings</span>
              <span style={{ fontSize: "22px" }}>💳</span>
            </div>
            <div className="wallet-amount-big">${totalEarned.toFixed(2)}</div>

            <div className="wallet-breakdown-row">
              <div className="wallet-sub-card">
                <span className="wallet-sub-title">Cash in Hand (COD)</span>
                <span className="wallet-sub-val">${cashCollected.toFixed(2)}</span>
              </div>
              <div className="wallet-sub-card">
                <span className="wallet-sub-title">Pending Settlement</span>
                <span className="wallet-sub-val" style={{ color: "var(--success)" }}>
                  ${pendingPayout.toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          <div className="payout-info-notice">
            <h4 style={{ fontSize: "14px", fontWeight: "800", color: "var(--text)", marginBottom: "4px" }}>
              Weekly Automated Payouts
            </h4>
            <p>
              Your pending digital payouts are settled directly to your registered bank account every Monday. Cash collected on COD orders is reconciled automatically by Admin.
            </p>
          </div>
        </aside>

        {/* Right Column: Completed Trip History */}
        <section className="trips-history-section">
          <div className="section-title-bar">
            <h2 className="section-heading">Completed Trips History ({completedOrders.length})</h2>
          </div>

          {completedOrders.length === 0 ? (
            <div className="empty-history-box">
              <svg viewBox="0 0 24 24" width="44" height="44" fill="#94a3b8">
                <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z" />
              </svg>
              <h3 style={{ fontSize: "16px", color: "var(--text)" }}>No Completed Deliveries Yet</h3>
              <p style={{ maxWidth: "420px", fontSize: "14px" }}>
                Complete your active deliveries to see individual trip payouts and commission logs recorded here.
              </p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {completedOrders.map((order) => {
                const tripPayout = Math.max(3.5, Math.round(order.amount * 0.15 * 10) / 10);
                return (
                  <div key={order._id} className="history-card">
                    <div>
                      <div className="history-customer">
                        {order.address?.firstName} {order.address?.lastName}
                      </div>
                      <div className="history-meta">
                        Order #{order._id?.slice(-6)} •{" "}
                        {order.date ? new Date(order.date).toLocaleDateString() : "Recent"} •{" "}
                        {order.items?.length || 1} items delivered
                      </div>
                    </div>
                    <span className="history-payout-pill">+${tripPayout.toFixed(2)}</span>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default Earnings;
