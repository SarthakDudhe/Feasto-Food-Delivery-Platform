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

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({ type: 'loading', message: 'Submitting application...' });
    
    try {
      const res = await axios.post(`${url}/api/rider/register`, formData);
      if (res.data.success) {
        setStatus({ 
          type: 'success', 
          message: 'Application submitted successfully! Admin operations team will review your KYC credentials.' 
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
    <div className="rider-signup-page-wrapper">
      <div className="rider-signup-card">
        {/* Brand Header */}
        <div className="rider-signup-brand">
          <span className="rider-fleet-badge">⚡ COURIER PARTNER ONBOARDING</span>
          <h2>Join Feasto Delivery Fleet 🛵</h2>
          <p className="rider-signup-subtext">Deliver gourmet orders, earn competitive payouts, and control your schedule.</p>
        </div>
        
        {/* Status Banner */}
        {status.message && (
          <div className={`signup-status-banner ${status.type}`}>
            {status.type === 'success' ? '🎉 ' : status.type === 'error' ? '⚠️ ' : '⏳ '}
            <span>{status.message}</span>
            {status.type === 'success' && (
              <div style={{ marginTop: '10px' }}>
                <button 
                  type="button" 
                  onClick={() => navigate('/rider-dashboard')}
                  className="btn-go-rider-login"
                >
                  Go to Rider Login &amp; Check Admin KYC Status →
                </button>
              </div>
            )}
          </div>
        )}

        {status.type !== 'success' && (
          <form onSubmit={handleSubmit} className="rider-signup-form">
            <div className="signup-form-group">
              <label>Full Name</label>
              <div className="signup-input-icon-wrapper">
                <span className="signup-prefix-icon">👤</span>
                <input 
                  type="text" 
                  name="name" 
                  value={formData.name} 
                  onChange={handleChange} 
                  required 
                  placeholder="e.g. Alex Rivera" 
                />
              </div>
            </div>
            
            <div className="signup-form-group">
              <label>Email Address</label>
              <div className="signup-input-icon-wrapper">
                <span className="signup-prefix-icon">✉️</span>
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
            
            <div className="signup-form-group">
              <label>Phone Number</label>
              <div className="signup-input-icon-wrapper">
                <span className="signup-prefix-icon">📞</span>
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
            
            <div className="signup-form-group">
              <label>Account Password</label>
              <div className="signup-input-icon-wrapper">
                <span className="signup-prefix-icon">🔒</span>
                <input 
                  type={showPassword ? "text" : "password"} 
                  name="password" 
                  value={formData.password} 
                  onChange={handleChange} 
                  required 
                  placeholder="Minimum 8 characters" 
                  minLength="8" 
                />
                <button 
                  type="button" 
                  className="signup-eye-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                  title={showPassword ? "Hide Password" : "Show Password"}
                >
                  {showPassword ? "🙈" : "👁️"}
                </button>
              </div>
            </div>
            
            <div className="signup-form-group">
              <label>Vehicle Type</label>
              <div className="signup-input-icon-wrapper">
                <span className="signup-prefix-icon">🛵</span>
                <select name="vehicleType" value={formData.vehicleType} onChange={handleChange}>
                  <option value="Scooter">Motor Scooter</option>
                  <option value="E-Bike">Electric E-Bike</option>
                  <option value="Bicycle">Bicycle</option>
                  <option value="Van">Delivery Van</option>
                </select>
              </div>
            </div>

            {/* Admin Audit Requirement Preview Checklist */}
            <div className="admin-audit-preview-card">
              <span className="preview-title">🛡️ Admin Verification Requirements</span>
              <ul>
                <li><span className="check-dot">✓</span> Valid Driving License &amp; Government Photo ID</li>
                <li><span className="check-dot">✓</span> Active Vehicle Registration (RC)</li>
                <li><span className="check-dot">✓</span> Direct Bank Payout Verification</li>
              </ul>
            </div>
            
            <button type="submit" className="btn-signup-submit" disabled={status.type === 'loading'}>
              {status.type === 'loading' ? 'Submitting Application...' : '🚀 Submit Courier Application'}
            </button>
          </form>
        )}

        <div className="rider-signup-footer">
          <p>Already registered? <Link to="/rider-dashboard">Login to Rider Portal →</Link></p>
        </div>
      </div>
    </div>
  );
};

export default RiderSignup;
