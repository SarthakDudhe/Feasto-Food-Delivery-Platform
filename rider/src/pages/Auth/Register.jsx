import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import { useRider } from "../../context/RiderContext";
import "./Auth.css";

const Register = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    vehicleType: "Scooter",
  });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const { backendUrl } = useRider();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await axios.post(`${backendUrl}/api/rider/register`, formData);

      if (res.data.success) {
        toast.success(res.data.message || "Registration submitted!");
        setSubmitted(true);
      } else {
        toast.error(res.data.message);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Registration failed. Try again.");
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="auth-container">
        <div className="auth-card" style={{ textAlign: "center" }}>
          <div className="auth-logo" style={{ background: "linear-gradient(135deg, #10b981 0%, #059669 100%)" }}>
            <svg viewBox="0 0 24 24" width="30" height="30" fill="currentColor">
              <path d="M9 16.2L4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2z" />
            </svg>
          </div>
          <h2 className="auth-title">Application Submitted!</h2>
          <p className="auth-subtitle" style={{ marginBottom: "20px" }}>
            Your rider application is currently <strong>Pending Verification</strong> by the Feasto Operations team.
          </p>
          <div className="status-alert alert-warning">
            Once an admin verifies your profile in the Admin Console, you will be able to log in and accept dispatches.
          </div>
          <button className="submit-btn" onClick={() => navigate("/login")}>
            Back to Sign In
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <div className="auth-logo">
            <svg viewBox="0 0 24 24" width="30" height="30" fill="currentColor">
              <path d="M19 7c0-1.1-.9-2-2-2h-3v2h3v2.65L13.52 14H10V9H6c-2.21 0-4 1.79-4 4v3h2c0 1.66 1.34 3 3 3s3-1.34 3-3h4.18c.41 0 .8-.17 1.08-.47L19 12.35V7zM7 17c-.55 0-1-.45-1-1h2c0 .55-.45 1-1 1zm12 0c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3zm0-4c-.55 0-1 .45-1 1s.45 1 1 1 1-.45 1-1-.45-1-1-1z" />
            </svg>
          </div>
          <h2 className="auth-title">Join Feasto Fleet</h2>
          <p className="auth-subtitle">Deliver fast, earn flexible daily payouts</p>
        </div>

        <form onSubmit={handleRegister} className="auth-form">
          <div className="form-group">
            <label>Full Name</label>
            <input
              type="text"
              name="name"
              placeholder="e.g. Alex Rivera"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Email Address</label>
            <input
              type="email"
              name="email"
              placeholder="e.g. alex@feasto.com"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Phone Number</label>
            <input
              type="tel"
              name="phone"
              placeholder="+91 98765 43210"
              value={formData.phone}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Vehicle Type</label>
            <select name="vehicleType" value={formData.vehicleType} onChange={handleChange}>
              <option value="Motorcycle">Motorcycle</option>
              <option value="Scooter">Scooter / Electric Scooter</option>
              <option value="Bicycle">Bicycle</option>
              <option value="Car">Car / Van</option>
            </select>
          </div>

          <div className="form-group">
            <label>Password (min 8 chars)</label>
            <input
              type="password"
              name="password"
              placeholder="Create strong password"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>

          <button type="submit" className="submit-btn" disabled={loading}>
            {loading ? "Submitting Application..." : "Submit Rider Registration"}
          </button>
        </form>

        <div className="auth-toggle">
          Already registered?{" "}
          <Link to="/login">
            <span>Sign In</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
