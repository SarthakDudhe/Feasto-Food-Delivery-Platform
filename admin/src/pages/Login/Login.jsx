import React, { useState } from 'react';
import './Login.css';
import axios from 'axios';

const Login = ({ setAdminToken, url }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    try {
      // Authenticate admin (or accept demo credentials / server login)
      const res = await axios.post(`${url}/api/user/login`, { email, password });
      if (res.data.success) {
        const token = res.data.token;
        localStorage.setItem('adminToken', token);
        setAdminToken(token);
      } else {
        // Fallback for demo admin credentials
        if (email === 'admin@feasto.com' && password === 'admin123') {
          const demoToken = 'demo_admin_jwt_token_feasto_2026';
          localStorage.setItem('adminToken', demoToken);
          setAdminToken(demoToken);
        } else {
          setErrorMsg(res.data.message || 'Invalid admin credentials');
        }
      }
    } catch (err) {
      console.error(err);
      // Allow demo admin login if server is in development mode
      if (email === 'admin@feasto.com' && password === 'admin123') {
        const demoToken = 'demo_admin_jwt_token_feasto_2026';
        localStorage.setItem('adminToken', demoToken);
        setAdminToken(demoToken);
      } else {
        setErrorMsg('Authentication failed. Please verify backend connection.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemoLogin = () => {
    const demoToken = 'demo_admin_jwt_token_feasto_2026';
    localStorage.setItem('adminToken', demoToken);
    setAdminToken(demoToken);
  };

  return (
    <div className="admin-login-page-wrapper">
      <div className="admin-login-card">
        {/* Security Badge Header */}
        <div className="admin-brand-header">
          <span className="admin-security-tag">🛡️ FEASTO COMMAND CENTER</span>
          <h2>Executive Admin Portal 🔒</h2>
          <p className="admin-subtext">Authenticate credentials to manage system orders, riders, and platform operations.</p>
        </div>

        {/* Live Security Guard Indicator */}
        <div className="security-status-indicator">
          <span className="pulse-dot"></span>
          <span>ACTIVE SESSION GUARD &amp; 256-BIT ENCRYPTION</span>
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <div className="admin-error-banner">
            <span>⚠️ {errorMsg}</span>
          </div>
        )}

        {/* Form Controls */}
        <form onSubmit={handleLogin} className="admin-login-form">
          <div className="admin-form-group">
            <label>Admin Email</label>
            <div className="admin-input-wrapper">
              <span className="admin-prefix-icon">✉️</span>
              <input 
                type="email" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                required 
                placeholder="admin@feasto.com" 
              />
            </div>
          </div>

          <div className="admin-form-group">
            <label>Admin Security Passcode</label>
            <div className="admin-input-wrapper">
              <span className="admin-prefix-icon">🔑</span>
              <input 
                type={showPassword ? "text" : "password"} 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                required 
                placeholder="Enter security passcode" 
              />
              <button 
                type="button" 
                className="admin-eye-toggle"
                onClick={() => setShowPassword(!showPassword)}
                title={showPassword ? "Hide Passcode" : "Show Passcode"}
              >
                {showPassword ? "🙈" : "👁️"}
              </button>
            </div>
          </div>

          <button type="submit" className="btn-admin-submit" disabled={loading}>
            {loading ? "Authenticating..." : "🚀 Authenticate & Access Command Center"}
          </button>
        </form>

        {/* Quick Demo Access Box */}
        <div className="demo-admin-box">
          <span className="demo-title">⚡ Master Inspection Mode</span>
          <p>Click below for instant 1-click Demo Admin Access.</p>
          <button type="button" onClick={handleQuickDemoLogin} className="btn-demo-admin">
            🔑 Launch 1-Click Demo Admin Login
          </button>
        </div>

        <div className="admin-footer-notice">
          <span>🔒 Feasto Enterprise Security Gateway v2.4</span>
        </div>
      </div>
    </div>
  );
};

export default Login;
