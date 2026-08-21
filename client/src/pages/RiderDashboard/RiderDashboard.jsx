import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import io from "socket.io-client";
import { Link } from "react-router-dom";
import RiderMap from "../../components/RiderMap/RiderMap";
import "./RiderDashboard.css";
import "../RiderSignup/RiderSignup.css";

const KITCHEN_COORDS = [72.8296, 19.0544];
const url = "http://localhost:4000";

const socket = io(url, { transports: ["websocket"] });

export default function RiderDashboard() {
  const [token, setToken] = useState(localStorage.getItem("riderToken") || "");
  const [riderData, setRiderData] = useState(JSON.parse(localStorage.getItem("riderData")) || null);
  const [showRiderPassword, setShowRiderPassword] = useState(false);
  
  const [authData, setAuthData] = useState({ email: "", password: "" });
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isOnDuty, setIsOnDuty] = useState(true);
  
  const [activeSimulations, setActiveSimulations] = useState({});
  const simulationStepsRef = useRef({});

  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otpInput, setOtpInput] = useState("");
  const [otpOrderId, setOtpOrderId] = useState(null);

  // Chat states: map of orderId -> array of messages
  const [chats, setChats] = useState({});
  const [chatInputs, setChatInputs] = useState({});



  const toggleDuty = async () => {
    if (!riderData || !riderData._id) return;
    try {
      const newStatus = !isOnDuty;
      const res = await axios.post(`${url}/api/rider/toggle-duty`, {
        riderId: riderData._id,
        isOnDuty: newStatus
      });
      if (res.data.success) {
        setIsOnDuty(res.data.isOnDuty);
        const updated = { ...riderData, isOnDuty: res.data.isOnDuty };
        setRiderData(updated);
        localStorage.setItem("riderData", JSON.stringify(updated));
      }
    } catch (err) {
      console.error("Failed to toggle duty", err);
    }
  };

  const fetchAssignedOrders = async () => {
    if (!riderData || !riderData._id) return;
    try {
      const res = await axios.get(`${url}/api/order/list`);
      if (res.data && res.data.success) {
        const assigned = res.data.data.filter(o => o.riderId === riderData._id);
        setOrders(assigned);
        
        // Initialize chats for assigned orders
        const newChats = { ...chats };
        assigned.forEach(o => {
          if (!newChats[o._id]) {
             newChats[o._id] = o.chat || [];
             socket.emit("join_order_room", o._id);
          } else {
             if (o.chat && o.chat.length > newChats[o._id].length) {
               newChats[o._id] = o.chat;
             }
          }
        });
        setChats(newChats);
      }
    } catch (err) {
      console.error("Error fetching orders for rider:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token && riderData) {
      setLoading(true);
      if (riderData.isOnDuty !== undefined) setIsOnDuty(riderData.isOnDuty);
      fetchAssignedOrders();
      const pollInterval = setInterval(fetchAssignedOrders, 10000);

      socket.on("receive_message", (data) => {
        setChats((prevChats) => {
          const orderChats = prevChats[data.orderId] || [];
          return {
            ...prevChats,
            [data.orderId]: [...orderChats, data]
          };
        });
      });

      return () => {
        clearInterval(pollInterval);
        socket.off("receive_message");
      };
    }
  }, [token, riderData]);

  const handleUpdateStatus = async (orderId, newStatus) => {
    try {
      const res = await axios.post(`${url}/api/order/status`, { orderId, status: newStatus });
      if (res.data.success) {
        fetchAssignedOrders();
      }
    } catch (err) {
      console.error("Status update failed:", err);
    }
  };

  const handleSendMessage = async (orderId) => {
    const text = chatInputs[orderId];
    if (!text || text.trim() === "") return;

    const messageData = {
      orderId,
      sender: "Rider",
      text,
      timestamp: new Date()
    };

    socket.emit("send_message", messageData);

    setChats(prev => ({
      ...prev,
      [orderId]: [...(prev[orderId] || []), messageData]
    }));

    await axios.post(`${url}/api/order/chat`, messageData);

    setChatInputs(prev => ({ ...prev, [orderId]: "" }));
  };

  const openOtpModal = (orderId) => {
    setOtpOrderId(orderId);
    setShowOtpModal(true);
    setOtpInput("");
  };

  const handleVerifyOtp = async () => {
    try {
      const res = await axios.post(`${url}/api/order/verify-delivery`, {
        orderId: otpOrderId,
        otp: otpInput
      });
      if (res.data.success) {
        alert("Delivery Verified Successfully!");
        setShowOtpModal(false);
        fetchAssignedOrders();
        
        if (activeSimulations[otpOrderId]) {
            clearInterval(activeSimulations[otpOrderId]);
            setActiveSimulations((prev) => {
              const next = { ...prev };
              delete next[otpOrderId];
              return next;
            });
            delete simulationStepsRef.current[otpOrderId];
        }
      } else {
        alert(res.data.message || "Invalid OTP!");
      }
    } catch (error) {
      console.error(error);
      alert("Error verifying OTP");
    }
  };

  const toggleLiveSimulation = (order) => {
    const orderId = order._id;

    if (activeSimulations[orderId]) {
      clearInterval(activeSimulations[orderId]);
      setActiveSimulations((prev) => {
        const next = { ...prev };
        delete next[orderId];
        return next;
      });
      return;
    }

    const targetLng = order.address?.lng || 72.8347;
    const targetLat = order.address?.lat || 19.1136;
    const startLng = order.riderLng || KITCHEN_COORDS[0];
    const startLat = order.riderLat || KITCHEN_COORDS[1];

    let currentStep = simulationStepsRef.current[orderId] || 0;
    const totalSteps = 25; 

    handleUpdateStatus(orderId, "Out for delivery");

    const intervalId = setInterval(async () => {
      currentStep++;
      simulationStepsRef.current[orderId] = currentStep;

      const progress = Math.min(currentStep / totalSteps, 1);
      const currLng = startLng + (targetLng - startLng) * progress;
      const currLat = startLat + (targetLat - startLat) * progress;

      try {
        await axios.post(`${url}/api/order/update-location`, {
          orderId,
          riderLat: currLat,
          riderLng: currLng,
          status: "Out for delivery",
        });
      } catch (err) {
        console.error("GPS simulation update failed:", err);
      }

      if (progress >= 1) {
        clearInterval(intervalId);
        setActiveSimulations((prev) => {
          const next = { ...prev };
          delete next[orderId];
          return next;
        });
        delete simulationStepsRef.current[orderId];
      }
    }, 2000);

    setActiveSimulations((prev) => ({ ...prev, [orderId]: intervalId }));
  };

  useEffect(() => {
    return () => {
      Object.values(activeSimulations).forEach((timer) => clearInterval(timer));
    };
  }, [activeSimulations]);
  const [authErrorStatus, setAuthErrorStatus] = useState(null); // 'Pending', 'Suspended', 'Blocked', or null

  const handleAuthChange = (e) => {
    setAuthData({ ...authData, [e.target.name]: e.target.value });
  };

  const submitAuth = async (e) => {
    e.preventDefault();
    setAuthErrorStatus(null);
    try {
      const res = await axios.post(url + "/api/rider/login", authData);
      if (res.data.success) {
        setToken(res.data.token);
        localStorage.setItem("riderToken", res.data.token);
        setRiderData(res.data.rider);
        localStorage.setItem("riderData", JSON.stringify(res.data.rider));
        if (res.data.rider.isOnDuty !== undefined) setIsOnDuty(res.data.rider.isOnDuty);
      } else {
        const msg = res.data.message || "";
        if (msg.toLowerCase().includes("pending")) {
          setAuthErrorStatus("Pending");
        } else if (msg.toLowerCase().includes("suspended")) {
          setAuthErrorStatus("Suspended");
        } else if (msg.toLowerCase().includes("blocked")) {
          setAuthErrorStatus("Blocked");
        } else {
          alert(msg);
        }
      }
    } catch (error) {
      console.error(error);
      alert("Authentication failed. Please check backend server connection.");
    }
  };

  const logout = () => {
    setToken("");
    setRiderData(null);
    setAuthErrorStatus(null);
    localStorage.removeItem("riderToken");
    localStorage.removeItem("riderData");
  };

  // Derived shift stats
  const deliveredToday = orders.filter(o => o.status === "Delivered").length;
  const activeOrdersCount = orders.filter(o => o.status !== "Delivered").length;
  const estimatedShiftEarnings = (deliveredToday * 4.5).toFixed(2);

  if (!token || !riderData) {
    return (
      <div className="split-signup-page-wrapper">
        <div className="split-signup-container">
          
          {/* LEFT COLUMN: HERO FLEET SHOWCASE */}
          <div className="signup-hero-column">
            <div className="hero-brand-header">
              <span className="hero-fleet-badge">⚡ FEASTO RIDER FLEET</span>
              <h1>Welcome Back, Feasto Rider 🛵</h1>
              <p className="hero-description">
                Log in to your active delivery portal to manage live orders, view customer dropoff navigation maps, and track daily shift earnings.
              </p>
            </div>

            <div className="hero-perk-chips">
              <div className="perk-chip">
                <span className="perk-icon">🗺️</span>
                <div>
                  <strong>Live Map &amp; Route Radar</strong>
                  <span>Turn-by-turn directions &amp; customer pins</span>
                </div>
              </div>

              <div className="perk-chip">
                <span className="perk-icon">💰</span>
                <div>
                  <strong>Direct Payouts &amp; Shift Stats</strong>
                  <span>Track base pay, tips, and shift performance</span>
                </div>
              </div>

              <div className="perk-chip">
                <span className="perk-icon">🟢</span>
                <div>
                  <strong>Live Duty Toggle Control</strong>
                  <span>Switch online/offline anytime on duty</span>
                </div>
              </div>
            </div>

            {/* Live Security Guard Indicator */}
            <div className="admin-timeline-box">
              <span className="timeline-title">🛡️ Fleet Security &amp; Admin Audit Guard</span>
              <p style={{ margin: 0, fontSize: '12.5px', color: '#6b7280', lineHeight: 1.4 }}>
                All rider accounts are audited by Feasto Admin Operations for valid driving credentials and safety compliance.
              </p>
            </div>
          </div>

          {/* RIGHT COLUMN: LUXURY LOGIN FORM */}
          <div className="signup-form-column">
            <div className="luxury-form-card">
              <div className="form-card-header">
                <h2>Rider Login Portal</h2>
                <p>Enter your rider email and password to start your delivery shift.</p>
              </div>

              {/* Admin KYC Verification Status Screen */}
              {authErrorStatus === "Pending" ? (
                <div className="kyc-verification-container">
                  <div className="kyc-status-header">
                    <span className="kyc-badge-pill pending">⏳ UNDER ADMIN REVIEW</span>
                    <h3>KYC Verification in Progress</h3>
                    <p>Your application and submitted documents are currently being audited by the Admin Operations Team.</p>
                  </div>

                  <div className="kyc-roadmap-steps">
                    <div className="kyc-step completed">
                      <div className="step-number">1</div>
                      <div className="step-info">
                        <strong>Account Registered</strong>
                        <span>Credentials &amp; Vehicle details saved</span>
                      </div>
                      <span className="step-icon">✅</span>
                    </div>

                    <div className="kyc-step active">
                      <div className="step-number">2</div>
                      <div className="step-info">
                        <strong>Admin Document Audit</strong>
                        <span>Driving License, RC &amp; Govt ID review</span>
                      </div>
                      <span className="step-icon">⏳</span>
                    </div>

                    <div className="kyc-step upcoming">
                      <div className="step-number">3</div>
                      <div className="step-info">
                        <strong>Fleet Activation</strong>
                        <span>Order dispatch radar enabled</span>
                      </div>
                      <span className="step-icon">🔒</span>
                    </div>
                  </div>

                  <div className="kyc-notice-box">
                    <span>⏱️ Average Review Time: <strong>12 - 24 Hours</strong></span>
                    <p>Once verified by Admin in Fleet Operations, your account will immediately unlock live order assignments.</p>
                  </div>

                  <div className="kyc-action-row">
                    <button type="button" className="btn-kyc-refresh" onClick={() => setAuthErrorStatus(null)}>
                      🔄 Try Logging In Again
                    </button>
                    <Link to="/rider-signup" className="btn-kyc-support">Re-submit Details</Link>
                  </div>
                </div>
              ) : authErrorStatus === "Suspended" || authErrorStatus === "Blocked" ? (
                <div className="kyc-verification-container error">
                  <div className="kyc-status-header">
                    <span className="kyc-badge-pill blocked">⚠️ ACCOUNT {authErrorStatus.toUpperCase()}</span>
                    <h3>Action Required</h3>
                    <p>Your rider account has been {authErrorStatus.toLowerCase()} by Admin Operations due to account policy or document updates.</p>
                  </div>
                  <button type="button" className="btn-kyc-refresh" onClick={() => setAuthErrorStatus(null)}>
                    ← Back to Login
                  </button>
                </div>
              ) : (
                <form onSubmit={submitAuth} className="luxury-signup-form">
                  <div className="signup-field">
                    <label>Email Address</label>
                    <div className="field-icon-wrapper">
                      <span className="field-icon">✉️</span>
                      <input 
                        type="email" 
                        name="email" 
                        placeholder="rider@feasto.com" 
                        onChange={handleAuthChange} 
                        required 
                      />
                    </div>
                  </div>

                  <div className="signup-field">
                    <label>Account Password</label>
                    <div className="field-icon-wrapper">
                      <span className="field-icon">🔒</span>
                      <input 
                        type={showRiderPassword ? "text" : "password"} 
                        name="password" 
                        placeholder="Enter account password" 
                        onChange={handleAuthChange} 
                        required 
                      />
                      <button 
                        type="button" 
                        className="eye-toggle-btn"
                        onClick={() => setShowRiderPassword(!showRiderPassword)}
                        title={showRiderPassword ? "Hide Password" : "Show Password"}
                      >
                        {showRiderPassword ? "🙈" : "👁️"}
                      </button>
                    </div>
                  </div>

                  <button type="submit" className="btn-luxury-submit">
                    🚀 Login to Delivery Portal &amp; Start Shift
                  </button>

                  <div className="luxury-form-footer">
                    <p>Not registered as a courier yet? <Link to="/rider-signup">Apply as Courier Partner →</Link></p>
                  </div>
                </form>
              )}
            </div>
          </div>

        </div>
      </div>
    );
  }

  return (
    <div className="rider-portal-container">
      {/* OTP Modal */}
      {showOtpModal && (
        <div className="otp-modal-overlay">
          <div className="otp-modal">
            <h3>Verify Delivery OTP</h3>
            <p>Please ask the customer for the 4-digit OTP shown on their tracking screen.</p>
            <input 
                type="text" 
                maxLength="4" 
                value={otpInput} 
                onChange={e => setOtpInput(e.target.value)} 
                placeholder="0 0 0 0" 
                className="otp-input"
            />
            <div className="otp-actions">
                <button onClick={() => setShowOtpModal(false)} className="btn-cancel">Cancel</button>
                <button onClick={handleVerifyOtp} className="btn-verify">Verify & Deliver</button>
            </div>
          </div>
        </div>
      )}

      {/* Header Banner */}
      <div className="rider-portal-header">
        <div className="rider-header-left">
          <span className="rider-badge">🛵 FEASTO FLEET PARTNER</span>
          <h1>Welcome back, {riderData.name}</h1>
          <p>Real-time turn-by-turn navigation & live order dispatch.</p>
        </div>

        <div className="rider-header-right">
          {/* Duty Switch Button */}
          <button 
            onClick={toggleDuty} 
            className={`duty-toggle-btn ${isOnDuty ? 'on-duty' : 'off-duty'}`}
          >
            <span className="duty-dot"></span>
            {isOnDuty ? 'ONLINE - ON DUTY' : 'OFFLINE - OFF DUTY'}
          </button>
          <button onClick={logout} className="rider-logout-btn">Logout</button>
        </div>
      </div>

      {/* Shift Performance Stats Bar */}
      <div className="driver-stats-bar">
        <div className="driver-stat-card">
          <span className="stat-icon">🛵</span>
          <div>
            <h3>{activeOrdersCount}</h3>
            <p>Active Assigned</p>
          </div>
        </div>
        <div className="driver-stat-card">
          <span className="stat-icon">✅</span>
          <div>
            <h3>{deliveredToday}</h3>
            <p>Delivered Today</p>
          </div>
        </div>
        <div className="driver-stat-card">
          <span className="stat-icon">💰</span>
          <div>
            <h3>${estimatedShiftEarnings}</h3>
            <p>Est. Shift Earnings</p>
          </div>
        </div>
      </div>

      {/* Deliveries List */}
      <div className="rider-deliveries-section">
        <h2>Active Delivery Tasks</h2>

        {loading ? (
          <div style={{ padding: "60px 0", textAlign: "center" }}><p>Loading active deliveries...</p></div>
        ) : orders.length > 0 ? (
          <div className="rider-orders-grid">
            {orders.map((order) => {
              const isSimulating = !!activeSimulations[order._id];
              const isDelivered = order.status === "Delivered";
              const isDelayed = !isDelivered && (new Date() - new Date(order.date || Date.now())) > 25 * 60 * 1000;

              return (
                <div
                  key={order._id}
                  className={`rider-order-card ${isSimulating ? "simulating" : ""} ${
                    isDelivered ? "delivered" : ""
                  }`}
                >
                  <div className="card-header-row">
                    <span className="order-id-tag">
                      #{order._id.substring(order._id.length - 6).toUpperCase()}
                    </span>
                    <div className="card-badges">
                      {isDelayed && (
                        <span className="sla-delay-badge" title="Order pending > 25 mins">
                          ⏱️ Priority SLA
                        </span>
                      )}
                      <span className={`order-status-badge ${order.status.toLowerCase().replace(/\s+/g, "-")}`}>
                        {order.status}
                      </span>
                    </div>
                  </div>

                  <div className="card-customer-info">
                    <h4>👤 {order.address.firstName} {order.address.lastName}</h4>
                    <p className="cust-phone">📞 {order.address.phone}</p>
                    <p className="cust-address">
                      📍 {order.address.street}, {order.address.city}, {order.address.state} - {order.address.pincode}
                    </p>
                  </div>

                  {/* INTERACTIVE RIDER NAVIGATION MAP */}
                  {!isDelivered && (
                    <div className="rider-map-section">
                      <div className="map-section-header">
                        <span>🗺️ Turn-by-Turn Route Navigation</span>
                      </div>
                      <RiderMap 
                        order={order} 
                        riderLocation={
                          (order.riderLat && order.riderLng) 
                            ? [order.riderLng, order.riderLat] 
                            : null
                        } 
                      />
                    </div>
                  )}

                  {order.notes && (
                    <div className="rider-notes-box">
                      <div>
                        <strong>Customer & Kitchen Note:</strong>
                        <p>"{order.notes}"</p>
                      </div>
                    </div>
                  )}

                  <div className="rider-card-actions">
                    <button
                      disabled={isDelivered}
                      onClick={() => handleUpdateStatus(order._id, "Out for delivery")}
                      className={`btn-rider-action pickup ${order.status === "Out for delivery" ? "active" : ""}`}
                    >
                      📦 Picked Up
                    </button>
                    <button
                      disabled={isDelivered}
                      onClick={() => toggleLiveSimulation(order)}
                      className={`btn-rider-action drive ${isSimulating ? "stop" : ""}`}
                    >
                      {isSimulating ? "🛑 Stop Drive Sim" : "🚀 Start Live Drive Sim"}
                    </button>
                    <button
                      disabled={isDelivered || order.status !== "Out for delivery"}
                      onClick={() => openOtpModal(order._id)}
                      className="btn-rider-action deliver"
                    >
                      ✅ Enter OTP to Deliver
                    </button>
                  </div>

                  {isSimulating && (
                    <div className="live-sim-status-bar">
                      <span className="pulse-dot-red"></span>
                      <span>Broadcasting live GPS location to customer map...</span>
                    </div>
                  )}

                  {/* CHAT BOX */}
                  <div className={`chat-container ${isDelivered ? "disabled" : ""}`}>
                    <div className="chat-history">
                      {(chats[order._id] || []).map((msg, i) => (
                        <div key={i} className={`chat-msg ${msg.sender === "Rider" ? "msg-rider" : "msg-customer"}`}>
                          <strong>{msg.sender}: </strong> {msg.text}
                        </div>
                      ))}
                    </div>
                    {isDelivered ? (
                      <div className="chat-closed-banner" style={{ padding: '10px', background: '#f3f4f6', color: '#6b7280', fontSize: '12px', fontWeight: 'bold', textCenter: 'center', textAlign: 'center', borderTop: '1px solid #e5e7eb' }}>
                        🔒 Chat closed — Order delivered successfully
                      </div>
                    ) : (
                      <div className="chat-input-row">
                        <input 
                          type="text" 
                          placeholder="Message customer..." 
                          value={chatInputs[order._id] || ""}
                          onChange={(e) => setChatInputs(prev => ({ ...prev, [order._id]: e.target.value }))}
                          onKeyDown={(e) => e.key === 'Enter' && handleSendMessage(order._id)}
                        />
                        <button onClick={() => handleSendMessage(order._id)}>Send</button>
                      </div>
                    )}
                  </div>

                </div>
              );
            })}
          </div>
        ) : (
          <div className="no-assigned-orders">
            <h3>No Active Deliveries Assigned</h3>
            <p>Wait for the Admin to assign you new orders.</p>
          </div>
        )}
      </div>
    </div>
  );
}
