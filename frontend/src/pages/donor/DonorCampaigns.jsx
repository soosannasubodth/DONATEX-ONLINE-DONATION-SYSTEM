import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaArrowLeft } from "react-icons/fa";
import "./DonorCampaigns.css";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

export default function DonorCampaigns() {
  const navigate = useNavigate();
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const fetchCampaigns = async () => {
    try {
      const response = await fetch(`${API_URL}/api/campaigns/`);
      if (!response.ok) throw new Error("Failed to fetch campaigns");

      const data = await response.json();
      setCampaigns(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getProgressPercentage = (campaign) => {
    if (!campaign.goal_amount || campaign.goal_amount === 0) return 0;
    return Math.min((campaign.total_amount_raised / campaign.goal_amount) * 100, 100);
  };

  const filteredCampaigns =
    filter === "all"
      ? campaigns
      : campaigns.filter((c) => c.status === filter);

  if (loading) return <div className="loading">Loading campaigns...</div>;

  return (
    <div className="donor-campaigns-container">
      <div className="back-dashboard-container">
        <button onClick={() => navigate("/donor/dashboard")} className="btn-back-dashboard">
          <FaArrowLeft /> Back to Dashboard
        </button>
      </div>

      <div className="page-header">
        <h1>Active Campaigns</h1>
        <p className="subtitle">Discover campaigns and make a difference</p>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="filter-section">
        <label>Filter:</label>
        <select value={filter} onChange={(e) => setFilter(e.target.value)}>
          <option value="all">All Campaigns</option>
          <option value="approved">Upcoming</option>
          <option value="active">Active Now</option>
        </select>
      </div>

      {filteredCampaigns.length === 0 ? (
        <div className="empty-state">
          <p>No campaigns available at the moment</p>
        </div>
      ) : (
        <div className="campaigns-grid">
          {filteredCampaigns.map((campaign) => (
            <div
              key={campaign.id}
              className="campaign-card"
              onClick={() => navigate(`/donor/campaigns/${campaign.id}`)}
            >
              <div className="card-image">
                {campaign.image_url ? (
                  <img src={campaign.image_url} alt={campaign.title} />
                ) : (
                  <div className="placeholder">📸</div>
                )}
                <span className="status-badge">{campaign.status.toUpperCase()}</span>
              </div>

              <div className="card-content">
                <h3>{campaign.title}</h3>
                <p className="ngo-name">by {campaign.ngo_name}</p>

                <p className="description">{campaign.description.substring(0, 80)}...</p>

                {campaign.goal_amount && (
                  <div className="progress-section">
                    <div className="progress-bar">
                      <div
                        className="progress-fill"
                        style={{ width: `${getProgressPercentage(campaign)}%` }}
                      ></div>
                    </div>
                    <div className="progress-text">
                      <span>₹ {campaign.total_amount_raised.toFixed(2)}</span>
                      <span>of ₹ {campaign.goal_amount}</span>
                    </div>
                  </div>
                )}

                <div className="stats">
                  <div className="stat">
                    <span className="number">👥 {campaign.participant_count}</span>
                    <small>Participants</small>
                  </div>
                  <div className="stat">
                    <span className="number">📅</span>
                    <small>{new Date(campaign.end_date).toLocaleDateString()}</small>
                  </div>
                </div>

                <button className="btn-view-action">View & Participate →</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
