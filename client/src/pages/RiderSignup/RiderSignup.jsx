import React, { useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import './RiderSignup.css';

const RiderSignup = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    vehicleType: 'Scooter'
  });
  
  const [status, setStatus] = useState({ type: '', message: '' });
  const navigate = useNavigate();
  const url = "http://localhost:4000";

  const vehicles = [
    { id: 'Scooter', name: 'Motor Scooter', icon: '🛵', perk: 'Best for long routes' },
    { id: 'E-Bike', name: 'Electric E-Bike', icon: '⚡', perk: 'Zero fuel cost' },
    { id: 'Bicycle', name: 'Bicycle', icon: '🚲', perk: 'Short city sprints' },
    { id: 'Van', name: 'Delivery Van', icon: '🚐', perk: 'Catering & large orders' }
  ];

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleVehicleSelect = (vehicleId) => {
    setFormData({ ...formData, vehicleType: vehicleId });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({ type: 'loading', message: 'Submitting application...' });
    
    try {
      const res = await axios.post(`${url}/api/rider/register`, formData);
      if (res.data.success) {
        setStatus({ 
          type: 'success', 
          message: 'Application submitted successfully! Your credentials and document profile are under Admin KYC review.' 
        });
        setFormData({ name: '', email: '', password: '', phone: '', vehicleType: 'Scooter' });
      } else {
        setStatus({ type: 'error', message: res.data.message });
      }
    } catch (error) {
      console.error(error);
      setStatus({ type: 'error', message: 'An error occurred while submitting your application.' });
    }
  };

  return (
    <div className="split-signup-page-wrapper">
      <div className="split-signup-container">
        
        {/* LEFT COLUMN: HERO SHOWCASE & FLEET PERKS */}
        <div className="signup-hero-column">
          <div className="hero-brand-header">
            <span className="hero-fleet-badge">⚡ FEASTO RIDER FLEET</span>
            <h1>Drive &amp; Earn as a Feasto Rider 🛵</h1>
            <p className="hero-description">
              Join 12,500+ active riders delivering gourmet meals across 45+ cities with high-rate payouts and instant daily settlements.
            </p>
          </div>

          <div className="hero-perk-chips">
            <div className="perk-chip">
              <span className="perk-icon">💰</span>
              <div>
                <strong>Earn Up to $35 / hr</strong>
                <span>Competitive base pay + 100% customer tips</span>
              </div>
            </div>

            <div className="perk-chip">
              <span className="perk-icon">⚡</span>
              <div>
                <strong>Instant Shift Payouts</strong>
                <span>Cash out earnings directly to your bank</span>
              </div>
            </div>

            <div className="perk-chip">
              <span className="perk-icon">🛡️</span>
              <div>
                <strong>100% Insurance Cover</strong>
                <span>Free accident &amp; emergency coverage on duty</span>
              </div>
            </div>
          </div>

          {/* Admin Verification Timeline */}
          <div className="admin-timeline-box">
            <span className="timeline-title">🎯 3-Step Rider Activation Workflow</span>
            <div className="timeline-steps">
              <div className="timeline-step">
                <span className="num">1</span>
                <span>Submit Profile</span>
              </div>
              <span className="arrow">→</span>
              <div className="timeline-step">
                <span className="num">2</span>
                <span>Admin KYC Audit</span>
              </div>
              <span className="arrow">→</span>
              <div className="timeline-step">
                <span className="num">3</span>
                <span>Start Delivering</span>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: LUXURY ONBOARDING FORM */}
        <div className="signup-form-column">
          <div className="luxury-form-card">
            <div className="form-card-header">
              <h2>Become a Feasto Rider</h2>
              <p>Complete your registration to submit credentials for Admin verification.</p>
            </div>

            {/* Status Banner */}
            {status.message && (
              <div className={`signup-status-banner ${status.type}`}>
                {status.type === 'success' ? '🎉 ' : status.type === 'error' ? '⚠️ ' : '⏳ '}
                <span>{status.message}</span>
                {status.type === 'success' && (
                  <div style={{ marginTop: '12px' }}>
                    <button 
                      type="button" 
                      onClick={() => navigate('/rider-dashboard')}
                      className="btn-go-rider-login"
                    >
                      Login &amp; Check Admin KYC Status →
                    </button>
                  </div>
                )}
              </div>
            )}

            {status.type !== 'success' && (
              <form onSubmit={handleSubmit} className="luxury-signup-form">
                
                {/* 2-Column Responsive Inputs Grid */}
                <div className="form-grid-2col">
                  <div className="signup-field">
                    <label>Full Name</label>
                    <div className="field-icon-wrapper">
                      <span className="field-icon">👤</span>
                      <input 
                        type="text" 
                        name="name" 
                        value={formData.name} 
                        onChange={handleChange} 
                        required 
                        placeholder="Alex Rivera" 
                      />
                    </div>
                  </div>

                  <div className="signup-field">
                    <label>Email Address</label>
                    <div className="field-icon-wrapper">
                      <span className="field-icon">✉️</span>
                      <input 
                        type="email" 
                        name="email" 
                        value={formData.email} 
                        onChange={handleChange} 
                        required 
                        placeholder="alex@example.com" 
                      />
                    </div>
                  </div>
                </div>

                <div className="form-grid-2col">
                  <div className="signup-field">
                    <label>Phone Number</label>
                    <div className="field-icon-wrapper">
                      <span className="field-icon">📞</span>
                      <input 
                        type="text" 
                        name="phone" 
                        value={formData.phone} 
                        onChange={handleChange} 
                        required 
                        placeholder="+91 9876543210" 
                      />
                    </div>
                  </div>

                  <div className="signup-field">
                    <label>Account Password</label>
                    <div className="field-icon-wrapper">
                      <span className="field-icon">🔒</span>
                      <input 
                        type={showPassword ? "text" : "password"} 
                        name="password" 
                        value={formData.password} 
                        onChange={handleChange} 
                        required 
                        placeholder="Min 8 characters" 
                        minLength="8" 
                      />
                      <button 
                        type="button" 
                        className="eye-toggle-btn"
                        onClick={() => setShowPassword(!showPassword)}
                        title={showPassword ? "Hide Password" : "Show Password"}
                      >
                        {showPassword ? "🙈" : "👁️"}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Interactive Vehicle Selection Cards */}
                <div className="vehicle-selection-section">
                  <label className="section-label">Select Your Delivery Vehicle</label>
                  <div className="vehicle-cards-grid">
                    {vehicles.map((v) => (
                      <div 
                        key={v.id}
                        className={`vehicle-card ${formData.vehicleType === v.id ? 'selected' : ''}`}
                        onClick={() => handleVehicleSelect(v.id)}
                      >
                        <span className="v-icon">{v.icon}</span>
                        <div className="v-info">
                          <strong>{v.name}</strong>
                          <span>{v.perk}</span>
                        </div>
                        {formData.vehicleType === v.id && <span className="v-check">✓</span>}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Admin Audit Requirement Preview */}
                <div className="kyc-preview-drawer">
                  <div className="kyc-preview-header">
                    <span>🛡️ Admin Document Audit Requirements</span>
                  </div>
                  <div className="kyc-preview-items">
                    <span className="item">✓ Government Photo ID (Passport/Aadhaar)</span>
                    <span className="item">✓ Active Driving License &amp; Vehicle Registration</span>
                    <span className="item">✓ Valid Bank Account for Payout Settlement</span>
                  </div>
                </div>

                <button type="submit" className="btn-luxury-submit" disabled={status.type === 'loading'}>
                  {status.type === 'loading' ? 'Submitting Application...' : '🚀 Submit Rider Application'}
                </button>
              </form>
            )}

            <div className="luxury-form-footer">
              <p>Already a registered rider? <Link to="/rider-dashboard">Login to Rider Portal →</Link></p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default RiderSignup;
