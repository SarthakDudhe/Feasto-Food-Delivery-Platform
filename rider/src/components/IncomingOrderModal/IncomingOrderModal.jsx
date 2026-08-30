import React, { useState, useEffect } from "react";
import { playDispatchAlert } from "../../utils/sound";
import "./IncomingOrderModal.css";

const IncomingOrderModal = ({ order, onAccept, onDecline }) => {
  const [timeLeft, setTimeLeft] = useState(30);

  useEffect(() => {
    if (!order) return;
    setTimeLeft(30);
    playDispatchAlert();

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          onDecline(order._id);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [order]);

  if (!order) return null;

  const estimatedPayout = Math.max(3.5, Math.round(order.amount * 0.15 * 10) / 10);

  return (
    <div className="incoming-modal-overlay">
      <div className="incoming-modal">
        <div className="incoming-header">
          <div className="alert-tag">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
              <path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2zm6-6v-5c0-3.07-1.63-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.64 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z" />
            </svg>
            NEW DISPATCH OFFER
          </div>
          <div className="countdown-circle">{timeLeft}s</div>
        </div>

        <div className="trip-payout-box">
          <div className="payout-label">Estimated Trip Earning</div>
          <div className="payout-amount">${estimatedPayout.toFixed(2)}</div>
        </div>

        <div className="route-preview-box">
          <div className="route-stop">
            <div className="stop-icon pickup">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                <path d="M18.06 22.99h1.66c.84 0 1.53-.64 1.63-1.48L23 5.05h-5V1h-1.97v4.05h-4.97l.3 2.34c1.71.47 3.31 1.32 4.27 2.26 1.44 1.42 2.43 2.89 2.43 5.29v8.05zM1 21.99V21h15.03v.99c0 .55-.45 1-1 1H2c-.55 0-1-.45-1-1z" />
              </svg>
            </div>
            <div className="stop-info">
              <span className="stop-title">Feasto Kitchen Central</span>
              <span className="stop-sub">{order.items?.length || 1} items to pick up</span>
            </div>
          </div>

          <div className="route-stop">
            <div className="stop-icon dropoff">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
              </svg>
            </div>
            <div className="stop-info">
              <span className="stop-title">
                {order.address?.firstName} {order.address?.lastName}
              </span>
              <span className="stop-sub">
                {order.address?.street}, {order.address?.city}
              </span>
            </div>
          </div>
        </div>

        <div className="modal-actions">
          <button className="decline-btn" onClick={() => onDecline(order._id)}>
            Decline
          </button>
          <button className="accept-btn" onClick={() => onAccept(order)}>
            Accept Delivery
          </button>
        </div>
      </div>
    </div>
  );
};

export default IncomingOrderModal;
