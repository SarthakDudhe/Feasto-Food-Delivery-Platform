import React from "react";
import { useRider } from "../../context/RiderContext";
import "./Profile.css";

const Profile = () => {
  const { rider, logout } = useRider();

  const accountStatus = rider?.accountStatus || "Pending";
  const rating = rider?.averageRating || 5.0;

  return (
    <div className="rider-app-shell">
      {/* Feasto Page Intro Banner */}
      <div className="page-intro">
        <span className="page-intro-eyebrow">PARTNER PROFILE & COMPLIANCE</span>
        <h1>Driver Profile & Verification</h1>
        <p>
          View your account verification status, registered delivery vehicle credentials, and performance ratings.
        </p>
      </div>

      {/* 2-Column Responsive Layout */}
      <div className="profile-grid-layout">
        {/* Left Column: ID Card */}
        <aside className="partner-card-sticky">
          <div className="partner-big-avatar">
            {rider?.name?.charAt(0).toUpperCase() || "R"}
          </div>
          <div>
            <h2 className="partner-fullname">{rider?.name}</h2>
            <div className="partner-phone-tag">{rider?.phone}</div>
          </div>
          <span className={`partner-status-tag ${accountStatus.toLowerCase()}`}>
            ● Account Status: {accountStatus}
          </span>
          <div style={{ fontSize: "14px", color: "var(--muted)", fontWeight: "600" }}>
            Registered: {rider?.vehicleType || "Scooter"}
          </div>

          <button className="logout-action-btn" onClick={logout} style={{ marginTop: "12px" }}>
            Log Out of Rider Portal
          </button>
        </aside>

        {/* Right Column: Account Details & KYC Checklist */}
        <section className="profile-details-column">
          <div className="details-block-card">
            <h3 className="block-card-title">Personal & Vehicle Information</h3>
            <div className="profile-info-row">
              <span className="info-prop-label">Email Address</span>
              <span className="info-prop-val">{rider?.email}</span>
            </div>
            <div className="profile-info-row">
              <span className="info-prop-label">Contact Phone</span>
              <span className="info-prop-val">{rider?.phone}</span>
            </div>
            <div className="profile-info-row">
              <span className="info-prop-label">Vehicle Registered</span>
              <span className="info-prop-val">{rider?.vehicleType || "Scooter / Motorcycle"}</span>
            </div>
            <div className="profile-info-row">
              <span className="info-prop-label">Average Customer Rating</span>
              <span className="info-prop-val" style={{ color: "var(--warning)" }}>
                ★ {Number(rating).toFixed(1)} ({rider?.totalRatings || 0} customer reviews)
              </span>
            </div>
          </div>

          <div className="details-block-card">
            <h3 className="block-card-title">KYC Document Verification Checklist</h3>
            <div className="profile-info-row">
              <span className="info-prop-label">Government Photo ID (Aadhaar / Passport)</span>
              <span className={`check-pill ${rider?.verificationDetails?.idVerified ? "verified" : "unverified"}`}>
                {rider?.verificationDetails?.idVerified ? "Verified ✓" : "Pending Review"}
              </span>
            </div>
            <div className="profile-info-row">
              <span className="info-prop-label">Driving License & Vehicle RC Docs</span>
              <span className={`check-pill ${rider?.verificationDetails?.vehicleDocsVerified ? "verified" : "unverified"}`}>
                {rider?.verificationDetails?.vehicleDocsVerified ? "Verified ✓" : "Pending Review"}
              </span>
            </div>
            <div className="profile-info-row">
              <span className="info-prop-label">Background & Safety Check</span>
              <span className={`check-pill ${rider?.verificationDetails?.backgroundCheckPassed ? "verified" : "unverified"}`}>
                {rider?.verificationDetails?.backgroundCheckPassed ? "Passed ✓" : "In Progress"}
              </span>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Profile;
