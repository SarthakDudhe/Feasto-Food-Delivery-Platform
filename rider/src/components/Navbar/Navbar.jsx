import React from "react";
import { NavLink } from "react-router-dom";
import { useRider } from "../../context/RiderContext";
import "./Navbar.css";

const Navbar = () => {
  const { rider, isOnDuty, toggleDuty, logout, activeDelivery } = useRider();

  return (
    <header className="feasto-navbar-header">
      <div className="navbar-container">
        {/* Brand Logo */}
        <div className="navbar-brand-section">
          <div className="feasto-logo-badge">
            <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor">
              <path d="M19 7c0-1.1-.9-2-2-2h-3v2h3v2.65L13.52 14H10V9H6c-2.21 0-4 1.79-4 4v3h2c0 1.66 1.34 3 3 3s3-1.34 3-3h4.18c.41 0 .8-.17 1.08-.47L19 12.35V7zM7 17c-.55 0-1-.45-1-1h2c0 .55-.45 1-1 1zm12 0c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3zm0-4c-.55 0-1 .45-1 1s.45 1 1 1 1-.45 1-1-.45-1-1-1z" />
            </svg>
          </div>
          <div className="brand-titles">
            <span className="brand-feasto">Feasto</span>
            <span className="brand-subtag">PARTNER DISPATCH</span>
          </div>
        </div>

        {/* Desktop Navigation Links */}
        <nav className="desktop-nav-links">
          <NavLink to="/" className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`} end>
            <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
              <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
            </svg>
            <span>Dashboard</span>
          </NavLink>

          <NavLink to="/active-trip" className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}>
            <div className="nav-trip-wrap">
              <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
              </svg>
              {activeDelivery && <span className="pulsing-trip-dot" />}
            </div>
            <span>Active Trip</span>
          </NavLink>

          <NavLink to="/earnings" className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}>
            <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
              <path d="M21 18v1c0 1.1-.9 2-2 2H5c-1.11 0-2-.9-2-2V5c0-1.1.89-2 2-2h14c1.1 0 2 .9 2 2v1h-9c-1.11 0-2 .9-2 2v8c0 1.1.89 2 2 2h9zm-9-2h10V8H12v8zm4-2.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z" />
            </svg>
            <span>Earnings</span>
          </NavLink>

          <NavLink to="/profile" className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}>
            <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
              <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
            </svg>
            <span>Profile</span>
          </NavLink>
        </nav>

        {/* Right Actions: Duty Toggle & Profile Card */}
        <div className="navbar-right-actions">
          {/* Duty Switch Button */}
          <button
            className={`feasto-duty-toggle ${isOnDuty ? "is-online" : "is-offline"}`}
            onClick={toggleDuty}
            title="Toggle Online / Offline status"
          >
            <span className="duty-dot" />
            <span className="duty-text">{isOnDuty ? "ONLINE" : "OFFLINE"}</span>
          </button>

          {/* User Partner Badge & Logout */}
          <div className="partner-profile-pill" onClick={logout} title="Click to log out">
            <div className="partner-avatar">
              {rider?.name ? rider.name.charAt(0).toUpperCase() : "R"}
            </div>
            <div className="partner-meta desktop-only">
              <span className="partner-name">{rider?.name?.split(" ")[0] || "Captain"}</span>
              <span className="partner-vehicle">{rider?.vehicleType || "Rider"}</span>
            </div>
            <div className="logout-icon-hint desktop-only">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                <path d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z" />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
