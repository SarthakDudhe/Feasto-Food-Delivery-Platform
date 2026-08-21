import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './ManageRiders.css';

const ManageRiders = ({ url }) => {
  const [riders, setRiders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('directory'); // 'directory', 'map', 'financials'
  const [statusFilter, setStatusFilter] = useState('All'); // 'All', 'Pending', 'Active', 'Suspended', 'Blocked'
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRider, setSelectedRider] = useState(null);
  const [modalTab, setModalTab] = useState('verification'); // 'verification', 'documents', 'access', 'payout', 'misconduct'

  // Modal forms state
  const [misconductForm, setMisconductForm] = useState({ reason: '', severity: 'Low' });
  const [verificationForm, setVerificationForm] = useState({
    idVerified: false,
    vehicleDocsVerified: false,
    backgroundCheckPassed: false
  });
  const [documentForm, setDocumentForm] = useState({
    idCardUrl: '',
    licenseUrl: '',
    vehicleRcUrl: '',
    notes: ''
  });
  const [payoutInput, setPayoutInput] = useState('');

  const fetchRiders = async () => {
    try {
      const response = await axios.get(`${url}/api/rider/list`);
      if (response.data.success) {
        setRiders(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching riders", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRiders();
    const intervalId = setInterval(() => {
      fetchRiders();
    }, 5000);
    return () => clearInterval(intervalId);
  }, []);

  const openRiderDetails = (rider) => {
    setSelectedRider(rider);
    setVerificationForm({
      idVerified: rider.verificationDetails?.idVerified || false,
      vehicleDocsVerified: rider.verificationDetails?.vehicleDocsVerified || false,
      backgroundCheckPassed: rider.verificationDetails?.backgroundCheckPassed || false
    });
    setDocumentForm({
      idCardUrl: rider.documents?.idCardUrl || '',
      licenseUrl: rider.documents?.licenseUrl || '',
      vehicleRcUrl: rider.documents?.vehicleRcUrl || '',
      notes: rider.documents?.notes || ''
    });
    setModalTab('verification');
  };

  const closeRiderDetails = () => {
    setSelectedRider(null);
    setMisconductForm({ reason: '', severity: 'Low' });
    setPayoutInput('');
  };

  const getRiderStatus = (rider) => {
    if (rider.accountStatus) return rider.accountStatus;
    return rider.isVerified ? 'Active' : 'Pending';
  };

  const handleStatusChange = async (status) => {
    try {
      const res = await axios.post(`${url}/api/rider/update-status`, { riderId: selectedRider._id, status });
      if (res.data.success) {
        fetchRiders();
        setSelectedRider({ ...selectedRider, accountStatus: status });
      } else {
        alert(res.data.message);
      }
    } catch (err) {
      console.error(err);
      alert("Failed to update status");
    }
  };

  const handleVerificationUpdate = async () => {
    try {
      const res = await axios.post(`${url}/api/rider/update-verification`, {
        riderId: selectedRider._id,
        ...verificationForm
      });
      if (res.data.success) {
        alert("Verification saved successfully!");
        fetchRiders();
        if (res.data.rider) setSelectedRider(res.data.rider);
      } else {
        alert(res.data.message);
      }
    } catch (err) {
      console.error(err);
      alert("Failed to update verification details");
    }
  };

  const handleSaveDocuments = async () => {
    try {
      const res = await axios.post(`${url}/api/rider/update-documents`, {
        riderId: selectedRider._id,
        ...documentForm
      });
      if (res.data.success) {
        alert("Document links & audit notes saved!");
        fetchRiders();
        if (res.data.rider) setSelectedRider(res.data.rider);
      } else {
        alert(res.data.message);
      }
    } catch (err) {
      console.error(err);
      alert("Failed to save document details");
    }
  };

  const handleSettlePayout = async () => {
    try {
      const amountToSettle = payoutInput ? parseFloat(payoutInput) : (selectedRider.earnings?.pendingPayout || 0);
      const res = await axios.post(`${url}/api/rider/settle-payout`, {
        riderId: selectedRider._id,
        amount: amountToSettle
      });
      if (res.data.success) {
        alert(res.data.message);
        setPayoutInput('');
        fetchRiders();
        if (res.data.rider) setSelectedRider(res.data.rider);
      } else {
        alert(res.data.message);
      }
    } catch (err) {
      console.error(err);
      alert("Failed to process payout settlement");
    }
  };

  const handleAddMisconduct = async (e) => {
    e.preventDefault();
    if (!misconductForm.reason.trim()) return;

    try {
      const res = await axios.post(`${url}/api/rider/add-misconduct`, {
        riderId: selectedRider._id,
        reason: misconductForm.reason,
        severity: misconductForm.severity
      });
      if (res.data.success) {
        alert("Misconduct report logged.");
        setMisconductForm({ reason: '', severity: 'Low' });
        fetchRiders();
        closeRiderDetails(); 
      } else {
        alert(res.data.message);
      }
    } catch (err) {
      console.error(err);
      alert("Failed to add misconduct report");
    }
  };

  // KPIs
  const totalRiders = riders.length;
  const activeFleet = riders.filter(r => getRiderStatus(r) === 'Active').length;
  const pendingKYC = riders.filter(r => getRiderStatus(r) === 'Pending').length;
  const onDutyCount = riders.filter(r => getRiderStatus(r) === 'Active' && r.isOnDuty !== false).length;
  const avgFleetRating = (riders.reduce((acc, r) => acc + (r.averageRating || 5), 0) / (totalRiders || 1)).toFixed(1);
  const totalPendingPayouts = riders.reduce((acc, r) => acc + (r.earnings?.pendingPayout || 0), 0).toFixed(2);

  // Filtered riders
  const filteredRiders = riders.filter(r => {
    const status = getRiderStatus(r);
    const matchesStatus = 
      statusFilter === 'All' ? true :
      statusFilter === 'Pending' ? status === 'Pending' :
      statusFilter === 'Active' ? status === 'Active' :
      statusFilter === 'Suspended' ? (status === 'Suspended' || status === 'Blocked') : true;

    const query = searchQuery.toLowerCase();
    const matchesSearch = !query || 
      r.name.toLowerCase().includes(query) ||
      r.email.toLowerCase().includes(query) ||
      r.phone.includes(query) ||
      (r.vehicleType && r.vehicleType.toLowerCase().includes(query));

    return matchesStatus && matchesSearch;
  });

  if (loading) {
    return (
      <div className="manage-riders-loading">
        <div className="loading-spinner"></div>
        <p>Syncing Fleet Operations Center...</p>
      </div>
    );
  }

  return (
    <div className="manage-riders-page add">
      {/* Header */}
      <div className="fleet-header">
        <div className="fleet-title-area">
          <span className="fleet-eyebrow">Enterprise Delivery Logistics</span>
          <h1>Fleet Operations Center</h1>
          <p>Real-time fleet monitoring, KYC compliance, dispatch mapping, and payout settlements.</p>
        </div>
      </div>

      {/* KPI Widgets */}
      <div className="fleet-kpi-grid">
        <div className="kpi-card">
          <div className="kpi-icon icon-active">🛵</div>
          <div className="kpi-info">
            <span className="kpi-label">Active Fleet</span>
            <div className="kpi-value-group">
              <span className="kpi-value">{activeFleet}</span>
              <span className="kpi-subtext">of {totalRiders} registered</span>
            </div>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon icon-duty">🟢</div>
          <div className="kpi-info">
            <span className="kpi-label">On-Duty Drivers</span>
            <div className="kpi-value-group">
              <span className="kpi-value">{onDutyCount}</span>
              <span className="pulse-indicator">Live Online</span>
            </div>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon icon-kyc">⌛</div>
          <div className="kpi-info">
            <span className="kpi-label">Pending Onboarding</span>
            <div className="kpi-value-group">
              <span className="kpi-value">{pendingKYC}</span>
              <span className="kpi-subtext">Needs document audit</span>
            </div>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon icon-rating">⭐</div>
          <div className="kpi-info">
            <span className="kpi-label">Avg Fleet Rating</span>
            <div className="kpi-value-group">
              <span className="kpi-value">{avgFleetRating}</span>
              <span className="kpi-subtext">Satisfaction score</span>
            </div>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon icon-payout">💳</div>
          <div className="kpi-info">
            <span className="kpi-label">Pending Payouts</span>
            <div className="kpi-value-group">
              <span className="kpi-value">${totalPendingPayouts}</span>
              <span className="kpi-subtext">Owed to riders</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main View Tabs */}
      <div className="fleet-view-navigation">
        <div className="view-tabs">
          <button 
            className={`tab-btn ${activeTab === 'directory' ? 'active' : ''}`} 
            onClick={() => setActiveTab('directory')}
          >
            📋 Fleet Directory ({filteredRiders.length})
          </button>
          <button 
            className={`tab-btn ${activeTab === 'map' ? 'active' : ''}`} 
            onClick={() => setActiveTab('map')}
          >
            🗺️ Live Dispatch Map
          </button>
          <button 
            className={`tab-btn ${activeTab === 'financials' ? 'active' : ''}`} 
            onClick={() => setActiveTab('financials')}
          >
            💰 Earnings & Payouts
          </button>
        </div>
      </div>

      {/* DIRECTORY VIEW */}
      {activeTab === 'directory' && (
        <div className="directory-view-container">
          <div className="table-controls-bar">
            <div className="search-box">
              <span className="search-icon">🔍</span>
              <input 
                type="text" 
                placeholder="Search riders by name, email, phone, vehicle..." 
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
              {searchQuery && <button className="clear-search" onClick={() => setSearchQuery('')}>✕</button>}
            </div>

            <div className="filter-pills">
              {['All', 'Active', 'Pending', 'Suspended'].map((status) => (
                <button
                  key={status}
                  className={`filter-pill ${statusFilter === status ? 'active' : ''}`}
                  onClick={() => setStatusFilter(status)}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>

          {filteredRiders.length === 0 ? (
            <div className="no-riders-msg">
              <p className="no-data-icon">🛵</p>
              <h3>No Riders Found</h3>
              <p>No delivery partners matched your search or status filter.</p>
            </div>
          ) : (
            <div className="riders-grid">
              {filteredRiders.map((rider) => {
                const status = getRiderStatus(rider);
                const isOnline = status === 'Active' && rider.isOnDuty !== false;
                const misconductCount = rider.misconductReports ? rider.misconductReports.length : 0;
                
                return (
                  <div key={rider._id} className={`rider-profile-card card-${status.toLowerCase()}`}>
                    <div className="rider-card-top">
                      <div className="avatar-badge">
                        <div className="rider-avatar">
                          {rider.name.charAt(0).toUpperCase()}
                        </div>
                        {isOnline && <span className="online-dot" title="Online On Duty"></span>}
                      </div>

                      <div className="rider-identity">
                        <h3>{rider.name}</h3>
                        <span className="vehicle-type-tag">🛵 {rider.vehicleType || 'Scooter'}</span>
                      </div>

                      <div className="status-badge-wrapper">
                        <span className={`status-badge badge-${status.toLowerCase()}`}>
                          {status}
                        </span>
                      </div>
                    </div>

                    <div className="rider-card-body">
                      <div className="detail-row">
                        <span className="detail-label">Email:</span>
                        <span className="detail-value">{rider.email}</span>
                      </div>
                      <div className="detail-row">
                        <span className="detail-label">Phone:</span>
                        <span className="detail-value">{rider.phone}</span>
                      </div>
                      <div className="detail-row">
                        <span className="detail-label">Rating:</span>
                        <span className="detail-value rating-stars">
                          ⭐ {rider.averageRating ? rider.averageRating.toFixed(1) : '5.0'} 
                          <small>({rider.totalRatings || 0} reviews)</small>
                        </span>
                      </div>

                      {misconductCount > 0 && (
                        <div className="misconduct-alert-banner">
                          ⚠️ {misconductCount} Misconduct Incident(s)
                        </div>
                      )}
                    </div>

                    <div className="rider-card-footer">
                      <button onClick={() => openRiderDetails(rider)} className="btn-manage-rider">
                        Manage Operations
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* LIVE DISPATCH MAP VIEW */}
      {activeTab === 'map' && (
        <div className="map-view-container">
          <div className="map-radar-header">
            <div className="radar-status">
              <span className="radar-pulse"></span>
              <h3>Live Fleet Radar Dispatch Map</h3>
            </div>
            <p>Visual representation of active on-duty delivery partners across service zone.</p>
          </div>

          <div className="mock-map-canvas">
            <div className="map-grid-overlay"></div>
            <div className="central-hub-pin">
              🏢 Central Kitchen Hub
            </div>

            {riders.filter(r => getRiderStatus(r) === 'Active').map((rider, index) => {
              const offsetAngle = (index * 60) * (Math.PI / 180);
              const distance = 90 + (index % 3) * 45;
              const topPos = 200 + Math.sin(offsetAngle) * distance;
              const leftPos = 400 + Math.cos(offsetAngle) * distance;

              return (
                <div 
                  key={rider._id} 
                  className="map-rider-pin" 
                  style={{ top: `${topPos}px`, left: `${leftPos}px` }}
                  onClick={() => openRiderDetails(rider)}
                >
                  <div className="pin-pulse"></div>
                  <div className="pin-marker">🛵</div>
                  <div className="pin-tooltip">
                    <strong>{rider.name}</strong>
                    <span>⭐ {rider.averageRating ? rider.averageRating.toFixed(1) : '5.0'}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* FINANCIALS & PAYOUTS VIEW */}
      {activeTab === 'financials' && (
        <div className="financials-view-container">
          <div className="financials-summary-box">
            <h2>Rider Earnings & COD Settlement Hub</h2>
            <p>Track cash collected by delivery partners and process pending payouts.</p>
          </div>

          <table className="financials-table">
            <thead>
              <tr>
                <th>Rider</th>
                <th>Status</th>
                <th>Total Earned</th>
                <th>COD Collected</th>
                <th>Pending Payout</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {riders.map((rider) => {
                const pending = rider.earnings?.pendingPayout || 0;
                const earned = rider.earnings?.totalEarned || 0;
                const cod = rider.earnings?.cashCollected || 0;
                const status = getRiderStatus(rider);

                return (
                  <tr key={rider._id}>
                    <td>
                      <div className="table-rider-info">
                        <strong>{rider.name}</strong>
                        <small>{rider.phone}</small>
                      </div>
                    </td>
                    <td>
                      <span className={`status-badge badge-${status.toLowerCase()}`}>{status}</span>
                    </td>
                    <td>${earned.toFixed(2)}</td>
                    <td>${cod.toFixed(2)}</td>
                    <td className="pending-cell">${pending.toFixed(2)}</td>
                    <td>
                      <button 
                        className="btn-payout-table"
                        onClick={() => openRiderDetails(rider)}
                      >
                        Process Payout
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* RIDER OPERATIONS MODAL DRAWER */}
      {selectedRider && (
        <div className="rider-modal-overlay" onClick={closeRiderDetails}>
          <div className="rider-modal-content" onClick={e => e.stopPropagation()}>
            {/* Modal Header */}
            <div className="modal-header">
              <div className="modal-header-info">
                <h2>{selectedRider.name}</h2>
                <span className="modal-sub-info">{selectedRider.email} • {selectedRider.phone}</span>
              </div>
              <button className="close-btn" onClick={closeRiderDetails}>✕</button>
            </div>

            {/* Modal Sub-Tabs */}
            <div className="modal-tabs">
              <button 
                className={modalTab === 'verification' ? 'active' : ''} 
                onClick={() => setModalTab('verification')}
              >
                ✔️ KYC Verification
              </button>
              <button 
                className={modalTab === 'documents' ? 'active' : ''} 
                onClick={() => setModalTab('documents')}
              >
                📄 Scanned Docs
              </button>
              <button 
                className={modalTab === 'access' ? 'active' : ''} 
                onClick={() => setModalTab('access')}
              >
                🔒 Account Access
              </button>
              <button 
                className={modalTab === 'payout' ? 'active' : ''} 
                onClick={() => setModalTab('payout')}
              >
                💳 Payouts
              </button>
              <button 
                className={modalTab === 'misconduct' ? 'active' : ''} 
                onClick={() => setModalTab('misconduct')}
              >
                ⚠️ Misconduct Log
              </button>
            </div>

            {/* Modal Body */}
            <div className="modal-body">
              {/* TAB 1: VERIFICATION */}
              {modalTab === 'verification' && (
                <div className="management-section">
                  <h3>KYC Compliance Audit</h3>
                  <p className="section-desc">Verify that background checks and mandatory documents are cleared.</p>
                  
                  <div className="checkbox-group">
                    <label className="checkbox-label">
                      <input 
                        type="checkbox" 
                        checked={verificationForm.idVerified} 
                        onChange={e => setVerificationForm({...verificationForm, idVerified: e.target.checked})} 
                      />
                      <span className="check-text">
                        <strong>Government ID Verified</strong>
                        <small>Aadhaar / National ID / Driving License scan uploaded</small>
                      </span>
                    </label>

                    <label className="checkbox-label">
                      <input 
                        type="checkbox" 
                        checked={verificationForm.vehicleDocsVerified} 
                        onChange={e => setVerificationForm({...verificationForm, vehicleDocsVerified: e.target.checked})} 
                      />
                      <span className="check-text">
                        <strong>Vehicle Registration & Insurance Verified</strong>
                        <small>RC & active commercial vehicle insurance policy</small>
                      </span>
                    </label>

                    <label className="checkbox-label">
                      <input 
                        type="checkbox" 
                        checked={verificationForm.backgroundCheckPassed} 
                        onChange={e => setVerificationForm({...verificationForm, backgroundCheckPassed: e.target.checked})} 
                      />
                      <span className="check-text">
                        <strong>Police & Background Check Passed</strong>
                        <small>Zero criminal record clearance report verified</small>
                      </span>
                    </label>
                  </div>

                  <button className="btn-primary-action" onClick={handleVerificationUpdate}>
                    Save KYC Audit Progress
                  </button>
                </div>
              )}

              {/* TAB 2: SCANNED DOCUMENTS */}
              {modalTab === 'documents' && (
                <div className="management-section">
                  <h3>Scanned Document Repository</h3>
                  <div className="doc-form-grid">
                    <div className="form-group">
                      <label>National ID Card Document URL:</label>
                      <input 
                        type="text" 
                        placeholder="https://example.com/docs/id.pdf" 
                        value={documentForm.idCardUrl} 
                        onChange={e => setDocumentForm({...documentForm, idCardUrl: e.target.value})} 
                      />
                    </div>
                    <div className="form-group">
                      <label>Driving License Document URL:</label>
                      <input 
                        type="text" 
                        placeholder="https://example.com/docs/license.pdf" 
                        value={documentForm.licenseUrl} 
                        onChange={e => setDocumentForm({...documentForm, licenseUrl: e.target.value})} 
                      />
                    </div>
                    <div className="form-group">
                      <label>Vehicle RC / Insurance Document URL:</label>
                      <input 
                        type="text" 
                        placeholder="https://example.com/docs/vehicle.pdf" 
                        value={documentForm.vehicleRcUrl} 
                        onChange={e => setDocumentForm({...documentForm, vehicleRcUrl: e.target.value})} 
                      />
                    </div>
                    <div className="form-group">
                      <label>Admin Audit Notes:</label>
                      <textarea 
                        rows="3" 
                        placeholder="Add compliance notes or issues found in verification..." 
                        value={documentForm.notes} 
                        onChange={e => setDocumentForm({...documentForm, notes: e.target.value})}
                      />
                    </div>
                  </div>
                  <button className="btn-primary-action" onClick={handleSaveDocuments}>
                    Save Document Links & Audit Notes
                  </button>
                </div>
              )}

              {/* TAB 3: ACCOUNT ACCESS */}
              {modalTab === 'access' && (
                <div className="management-section">
                  <h3>Account Status Controls</h3>
                  <p>Current Status: <strong className={`status-badge badge-${getRiderStatus(selectedRider).toLowerCase()}`}>{getRiderStatus(selectedRider)}</strong></p>
                  
                  <div className="status-buttons-grid">
                    <button className="btn-status btn-act" onClick={() => handleStatusChange('Active')} disabled={getRiderStatus(selectedRider) === 'Active'}>Set Active</button>
                    <button className="btn-status btn-susp" onClick={() => handleStatusChange('Suspended')} disabled={getRiderStatus(selectedRider) === 'Suspended'}>Suspend Fleet Access</button>
                    <button className="btn-status btn-blk" onClick={() => handleStatusChange('Blocked')} disabled={getRiderStatus(selectedRider) === 'Blocked'}>Block Permanently</button>
                  </div>
                </div>
              )}

              {/* TAB 4: PAYOUTS */}
              {modalTab === 'payout' && (
                <div className="management-section">
                  <h3>Payout Settlement Console</h3>
                  <div className="payout-stats-box">
                    <div>
                      <span>Pending Payout:</span>
                      <strong>${(selectedRider.earnings?.pendingPayout || 0).toFixed(2)}</strong>
                    </div>
                    <div>
                      <span>Total Earned:</span>
                      <strong>${(selectedRider.earnings?.totalEarned || 0).toFixed(2)}</strong>
                    </div>
                  </div>

                  <div className="payout-input-group">
                    <input 
                      type="number" 
                      placeholder={`Default full payout: $${selectedRider.earnings?.pendingPayout || 0}`} 
                      value={payoutInput}
                      onChange={e => setPayoutInput(e.target.value)}
                    />
                    <button className="btn-primary-action" onClick={handleSettlePayout}>
                      Settle Payout
                    </button>
                  </div>
                </div>
              )}

              {/* TAB 5: MISCONDUCT */}
              {modalTab === 'misconduct' && (
                <div className="management-section">
                  <h3>Incident & Misconduct System</h3>
                  <form onSubmit={handleAddMisconduct} className="misconduct-form">
                    <input 
                      type="text" 
                      placeholder="Reason for report (e.g. late delivery, rude behavior, order tampered)" 
                      value={misconductForm.reason} 
                      onChange={e => setMisconductForm({...misconductForm, reason: e.target.value})} 
                      required 
                    />
                    <select 
                      value={misconductForm.severity} 
                      onChange={e => setMisconductForm({...misconductForm, severity: e.target.value})}
                    >
                      <option value="Low">Low Severity</option>
                      <option value="Medium">Medium Severity</option>
                      <option value="High">High Severity (Auto-Suspends)</option>
                    </select>
                    <button type="submit" className="btn-add-strike">Log Incident</button>
                  </form>

                  <div className="misconduct-history">
                    {"Report History"}
                    {(!selectedRider.misconductReports || selectedRider.misconductReports.length === 0) ? (
                      <p className="no-history">No incident reports recorded. Exemplary fleet score!</p>
                    ) : (
                      <ul>
                        {selectedRider.misconductReports.map((report, idx) => (
                          <li key={idx} className={`severity-${report.severity.toLowerCase()}`}>
                            <div className="incident-date">{new Date(report.date).toLocaleDateString()}</div>
                            <div className="incident-reason">{report.reason}</div>
                            <span className="incident-severity-tag">{report.severity} Severity</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageRiders;
