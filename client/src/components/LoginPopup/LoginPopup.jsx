import React, { useContext, useState } from 'react';
import "./LoginPopup.css";
import { assets } from '../../assets/assets';
import { StoreContext } from '../../context/StoreContext';
import axios from "axios";
import { toast } from 'react-toastify';

const LoginPopup = ({ setShowLogin }) => {
  const { url, setToken } = useContext(StoreContext);

  const [currentState, setCurrentState] = useState("Sign Up");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState({
    name: "",
    email: "",
    password: ""
  });

  const onChangeHandler = (event) => {
    const name = event.target.name;
    const value = event.target.value;
    setData(prev => ({ ...prev, [name]: value }));
  };

  const onLogin = async (event) => {
    event.preventDefault();
    setLoading(true);

    let newURL = url;
    const isLogin = currentState === "Login";
    if (isLogin) {
      newURL += "/api/user/login";
    } else {
      newURL += "/api/user/register";
    }

    try {
      const response = await axios.post(newURL, data);
      if (response.data.success) {
        setToken(response.data.token);
        localStorage.setItem("token", response.data.token);
        setShowLogin(false);
        if (isLogin) {
          toast.success("Welcome back! Signed in successfully 🚀");
        } else {
          toast.success("Account created successfully! Welcome to Feasto 🎉");
        }
      } else {
        toast.error(response.data.message || "Authentication failed. Please try again.");
      }
    } catch (err) {
      console.error(err);
      toast.error("Authentication failed. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='login-popup'>
      <form onSubmit={onLogin} className='login-popup-container'>
        {/* Close Button */}
        <button 
          type="button" 
          className="login-close-btn" 
          onClick={() => setShowLogin(false)}
          title="Close Modal"
        >
          ✕
        </button>

        {/* Hero Header */}
        <div className="login-popup-header">
          <span className="feasto-brand-badge">✨ FEASTO AUTHENTICATION</span>
          <h2>{currentState === "Sign Up" ? "Create Your Account" : "Welcome Back"}</h2>
          <p className="login-header-sub">
            {currentState === "Sign Up" 
              ? "Join Feasto to explore gourmet meals, track macros, and earn rewards." 
              : "Access your saved orders, macro plans, and fast checkout."}
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="login-tab-switcher">
          <button 
            type="button" 
            className={`tab-switch-btn ${currentState === "Login" ? "active" : ""}`}
            onClick={() => setCurrentState("Login")}
          >
            Sign In
          </button>
          <button 
            type="button" 
            className={`tab-switch-btn ${currentState === "Sign Up" ? "active" : ""}`}
            onClick={() => setCurrentState("Sign Up")}
          >
            Create Account
          </button>
        </div>

        {/* Input Fields */}
        <div className="login-popup-inputs">
          {currentState === "Sign Up" && (
            <div className="input-field-group">
              <span className="field-prefix-icon">👤</span>
              <input 
                onChange={onChangeHandler} 
                value={data.name} 
                type="text" 
                name="name" 
                placeholder='Full Name' 
                required
              />
            </div>
          )}
          
          <div className="input-field-group">
            <span className="field-prefix-icon">✉️</span>
            <input 
              onChange={onChangeHandler} 
              value={data.email} 
              type="email" 
              name="email" 
              placeholder='Email Address' 
              required 
            />
          </div>

          <div className="input-field-group">
            <span className="field-prefix-icon">🔒</span>
            <input 
              onChange={onChangeHandler} 
              value={data.password} 
              type={showPassword ? "text" : "password"} 
              name="password" 
              placeholder='Password (min 8 chars)'  
              required 
            />
            <button 
              type="button" 
              className="password-toggle-eye"
              onClick={() => setShowPassword(!showPassword)}
              title={showPassword ? "Hide Password" : "Show Password"}
            >
              {showPassword ? "🙈" : "👁️"}
            </button>
          </div>
        </div>

        {/* Terms Checkbox */}
        <div className="login-popup-condition">
          <input type="checkbox" id="terms-check" required />
          <label htmlFor="terms-check">
            I agree to Feasto's <a href="#footer" onClick={() => setShowLogin(false)}>Terms of Service</a> &amp; <a href="#footer" onClick={() => setShowLogin(false)}>Privacy Policy</a>.
          </label>
        </div>

        {/* Shimmer CTA Button */}
        <button type='submit' className="btn-login-shimmer" disabled={loading}>
          {loading ? "Processing..." : currentState === "Sign Up" ? "🚀 Create Account" : "🔓 Sign In to Feasto"}
        </button>

        {/* Bottom Toggle Link */}
        <div className="login-footer-toggle">
          {currentState === "Sign Up" ? (
            <p>Already have an account? <span onClick={() => setCurrentState("Login")}>Sign In Here</span></p>
          ) : (
            <p>New to Feasto? <span onClick={() => setCurrentState("Sign Up")}>Create Account</span></p>
          )}
        </div>
      </form>
    </div>
  );
};

export default LoginPopup;