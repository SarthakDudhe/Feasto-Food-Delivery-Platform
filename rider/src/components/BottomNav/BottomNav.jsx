import React from "react";
import { NavLink } from "react-router-dom";
import { useRider } from "../../context/RiderContext";
import "./BottomNav.css";

const BottomNav = () => {
  const { activeDelivery } = useRider();

  return (
    <nav className="bottom-nav">
      <NavLink
        to="/"
        className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}
        end
      >
        <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
          <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
        </svg>
        <span>Home</span>
      </NavLink>

      <NavLink
        to="/active-trip"
        className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}
      >
        <div className="nav-icon-container">
          <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
          </svg>
          {activeDelivery && <span className="trip-badge-dot"></span>}
        </div>
        <span>Trip</span>
      </NavLink>

      <NavLink
        to="/earnings"
        className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}
      >
        <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
          <path d="M21 18v1c0 1.1-.9 2-2 2H5c-1.11 0-2-.9-2-2V5c0-1.1.89-2 2-2h14c1.1 0 2 .9 2 2v1h-9c-1.11 0-2 .9-2 2v8c0 1.1.89 2 2 2h9zm-9-2h10V8H12v8zm4-2.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z" />
        </svg>
        <span>Earnings</span>
      </NavLink>

      <NavLink
        to="/profile"
        className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}
      >
        <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
          <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
        </svg>
        <span>Profile</span>
      </NavLink>
    </nav>
  );
};

export default BottomNav;
