import React from 'react'
import "./Navbar.css"
import {assets} from "../../assets/assets"
const Navbar = ({ setAdminToken }) => {
  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    if (setAdminToken) setAdminToken("");
  };

  return (
    <div className='navbar'>
        <div className="navbar-brand">
          <img className='logo' src={assets.logo} alt="" />
          <div>
            <p className="navbar-title">Feasto Admin</p>
            <span className="navbar-subtitle">Command Center &amp; Fleet Operations</span>
          </div>
        </div>
        <div className="navbar-right">
          <span className="navbar-status">🛡️ Live Security Sync</span>
          <img className='profile' src={assets.profile_image} alt="Admin Profile" />
          <button type="button" onClick={handleLogout} className="btn-admin-logout">
            🚪 Logout
          </button>
        </div>
    </div>
  )
}

export default Navbar
