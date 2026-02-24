import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaArrowLeft } from "react-icons/fa";
import "./NgoCampaigns.css";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

export default function NgoCampaigns() {
  const navigate = useNavigate();
  const token = localStorage.getItem("access_token");
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const fetchCampaigns = async () => {
    try {
      const response = await fetch(`${API_URL}/api/ngo/campaigns/`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) throw new Error("Failed to fetch campaigns");

      const data = await response.json();
      setCampaigns(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: "#FFA500",
      approved: "#4CAF50",
      rejected: "#f44336",
      active: "#2196F3",
      completed: "#9C27B0",
    };
    return colors[status] || "#666";
  };

  const filteredCampaigns =
    filter === "all" ? campaigns : campaigns.filter((c) => c.status === filter);

  if (loading) return <div className="loading">Loading campaigns...</div>;

  return (
    <div className="ngo-campaigns-container">
      <div className="back-dashboard-container">
        <button onClick={() => navigate("/ngo-dashboard")} className="btn-back-dashboard">
          <FaArrowLeft /> Back to Dashboard
        </button>
      </div>

      <div className="header">
        <h1>My Campaigns</h1>
        <button
          className="btn-create"
          onClick={() => navigate("/ngo/campaigns/create")}
        >
          + New Campaign
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="filter-section">
        <label>Filter by Status:</label>
        <select value={filter} onChange={(e) => setFilter(e.target.value)}>
          <option value="all">All Campaigns</option>
          <option value="pending">Pending Approval</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
          <option value="active">Active</option>
          <option value="completed">Completed</option>
        </select>
      </div>

      {filteredCampaigns.length === 0 ? (
        <div className="empty-state">
          <p>No campaigns found</p>
          <button
            className="btn-primary"
            onClick={() => navigate("/ngo/campaigns/create")}
          >
            Create Your First Campaign
          </button>
        </div>
      ) : (
        <div className="campaigns-grid">
          {filteredCampaigns.map((campaign) => (
            <div
              key={campaign.id}
              className="campaign-card"
              onClick={() => navigate(`/ngo/campaigns/${campaign.id}`)}
            >
              {campaign.image_url && (
                <img src={campaign.image_url} alt={campaign.title} />
              )}
              <div className="campaign-content">
                <h3>{campaign.title}</h3>
                <p className="description">{campaign.description.substring(0, 100)}...</p>

                <div className="stats">
                  <div className="stat">
                    <span>👥 {campaign.participant_count}</span>
                    <small>Participants</small>
                  </div>
                  <div className="stat">
                    <span>₹ {campaign.total_amount_raised.toFixed(2)}</span>
                    <small>Raised</small>
                  </div>
                </div>

                <div className="footer">
                  <span
                    className="status-badge"
                    style={{ backgroundColor: getStatusColor(campaign.status) }}
                  >
                    {campaign.status.toUpperCase()}
                  </span>
                  <small>{new Date(campaign.created_at).toLocaleDateString()}</small>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
