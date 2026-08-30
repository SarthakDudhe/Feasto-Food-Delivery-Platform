import React from "react";
import { useRider } from "../../context/RiderContext";
import "./Profile.css";

const Profile = () => {
  const { rider, logout } = useRider();

  const accountStatus = rider?.accountStatus || "Pending";
  const rating = rider?.averageRating || 5.0;

  return (
    <div className="profile-container">
      <div className="profile-card">
        <div className="profile-header-row">
          <div className="profile-avatar-lg">
            {rider?.name?.charAt(0).toUpperCase() || "R"}
          </div>
          <div>
            <div style={{ fontSize: "18px", fontWeight: "800" }}>{rider?.name}</div>
            <div style={{ fontSize: "13px", color: "var(--text-muted)", marginBottom: "4px" }}>
              {rider?.phone}
            </div>
            <span className={`verification-status-badge ${accountStatus.toLowerCase()}`}>
              ● Account: {accountStatus}
            </span>
          </div>
        </div>
      </div>

      <div className="profile-card">
        <h3 style={{ fontSize: "15px", fontWeight: "700" }}>Rider Partner Details</h3>

        <div className="info-item">
          <span className="info-label">Email</span>
          <span className="info-val">{rider?.email}</span>
        </div>

        <div className="info-item">
          <span className="info-label">Vehicle Registered</span>
          <span className="info-val">{rider?.vehicleType || "Scooter"}</span>
        </div>

        <div className="info-item">
          <span className="info-label">Overall Rating</span>
          <span className="info-val" style={{ color: "#fbbf24" }}>
            ★ {Number(rating).toFixed(1)} ({rider?.totalRatings || 0} reviews)
          </span>
        </div>

        <div className="info-item">
          <span className="info-label">ID Verification</span>
          <span className="info-val" style={{ color: rider?.verificationDetails?.idVerified ? "#10b981" : "#f59e0b" }}>
            {rider?.verificationDetails?.idVerified ? "Verified ✓" : "Pending"}
          </span>
        </div>

        <div className="info-item">
          <span className="info-label">Vehicle Docs (RC/Insurance)</span>
          <span className="info-val" style={{ color: rider?.verificationDetails?.vehicleDocsVerified ? "#10b981" : "#f59e0b" }}>
            {rider?.verificationDetails?.vehicleDocsVerified ? "Verified ✓" : "Pending"}
          </span>
        </div>

        <div className="info-item">
          <span className="info-label">Background Check</span>
          <span className="info-val" style={{ color: rider?.verificationDetails?.backgroundCheckPassed ? "#10b981" : "#f59e0b" }}>
            {rider?.verificationDetails?.backgroundCheckPassed ? "Passed ✓" : "Pending"}
          </span>
        </div>
      </div>

      <button className="logout-btn-full" onClick={logout}>
        Log Out of Rider Portal
      </button>
    </div>
  );
};

export default Profile;
