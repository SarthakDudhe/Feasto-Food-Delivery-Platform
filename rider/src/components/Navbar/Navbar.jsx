import React from "react";
import { useRider } from "../../context/RiderContext";
import "./Navbar.css";

const Navbar = () => {
  const { rider, isOnDuty, toggleDuty, logout } = useRider();

  return (
    <header className="rider-navbar">
      <div className="navbar-brand">
        <div className="logo-icon">
          <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor">
            <path d="M19 7c0-1.1-.9-2-2-2h-3v2h3v2.65L13.52 14H10V9H6c-2.21 0-4 1.79-4 4v3h2c0 1.66 1.34 3 3 3s3-1.34 3-3h4.18c.41 0 .8-.17 1.08-.47L19 12.35V7zM7 17c-.55 0-1-.45-1-1h2c0 .55-.45 1-1 1zm12 0c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3zm0-4c-.55 0-1 .45-1 1s.45 1 1 1 1-.45 1-1-.45-1-1-1z" />
          </svg>
        </div>
        <div className="brand-text">
          <span className="brand-name">Feasto</span>
          <span className="brand-role">RIDER</span>
        </div>
      </div>

      <div className="navbar-actions">
        {/* On Duty / Off Duty Toggle Switch */}
        <button
          className={`duty-pill ${isOnDuty ? "duty-on" : "duty-off"}`}
          onClick={toggleDuty}
          title="Click to toggle Online/Offline duty status"
        >
          <span className="duty-indicator"></span>
          <span className="duty-label">{isOnDuty ? "ONLINE" : "OFFLINE"}</span>
        </button>

        {/* User Profile Avatar / Logout Dropdown */}
        <div className="user-profile-badge" onClick={logout} title="Click to logout">
          <div className="avatar-circle">
            {rider?.name ? rider.name.charAt(0).toUpperCase() : "R"}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
