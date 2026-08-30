import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import { useRider } from "../../context/RiderContext";
import "./Auth.css";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [pendingMessage, setPendingMessage] = useState("");

  const { backendUrl, login } = useRider();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setPendingMessage("");

    try {
      const res = await axios.post(`${backendUrl}/api/rider/login`, {
        email,
        password,
      });

      if (res.data.success) {
        toast.success("Welcome back, Captain! 🚀");
        login(res.data.token, res.data.rider);
        navigate("/");
      } else {
        toast.error(res.data.message);
        if (res.data.message.includes("pending admin approval") || res.data.message.includes("suspended")) {
          setPendingMessage(res.data.message);
        }
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <div className="auth-logo">
            <svg viewBox="0 0 24 24" width="30" height="30" fill="currentColor">
              <path d="M19 7c0-1.1-.9-2-2-2h-3v2h3v2.65L13.52 14H10V9H6c-2.21 0-4 1.79-4 4v3h2c0 1.66 1.34 3 3 3s3-1.34 3-3h4.18c.41 0 .8-.17 1.08-.47L19 12.35V7zM7 17c-.55 0-1-.45-1-1h2c0 .55-.45 1-1 1zm12 0c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3zm0-4c-.55 0-1 .45-1 1s.45 1 1 1 1-.45 1-1-.45-1-1-1z" />
            </svg>
          </div>
          <h2 className="auth-title">Rider Partner Portal</h2>
          <p className="auth-subtitle">Sign in to start receiving delivery dispatches</p>
        </div>

        {pendingMessage && (
          <div className="status-alert alert-warning">
            <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" style={{ flexShrink: 0 }}>
              <path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z" />
            </svg>
            <div>{pendingMessage}</div>
          </div>
        )}

        <form onSubmit={handleLogin} className="auth-form">
          <div className="form-group">
            <label>Registered Email</label>
            <input
              type="email"
              placeholder="e.g. rider@feasto.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="submit-btn" disabled={loading}>
            {loading ? "Signing in..." : "Start Shift / Sign In"}
          </button>
        </form>

        <div className="auth-toggle">
          Don't have a rider account?{" "}
          <Link to="/register">
            <span>Register as Rider</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
