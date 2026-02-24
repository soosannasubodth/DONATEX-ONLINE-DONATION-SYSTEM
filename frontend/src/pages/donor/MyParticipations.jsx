import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaArrowLeft } from "react-icons/fa";
import "./MyParticipations.css";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

export default function MyParticipations() {
  const navigate = useNavigate();
  const token = localStorage.getItem("access_token");
  const [participations, setParticipations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    fetchParticipations();
  }, []);

  const fetchParticipations = async () => {
    try {
      const response = await fetch(`${API_URL}/api/donor/participations/`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) throw new Error("Failed to fetch participations");

      const data = await response.json();
      console.log("Fetched participations:", data); // DEBUG
      setParticipations(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const filteredParticipations =
    filter === "all"
      ? participations
      : participations.filter((p) => p.participation_type === filter);

  if (loading) return <div className="loading">Loading your participations...</div>;

  return (
    <div className="participations-container">
      <div className="back-dashboard-container">
        <button onClick={() => navigate("/donor/dashboard")} className="btn-back-dashboard">
          <FaArrowLeft /> Back to Dashboard
        </button>
      </div>

      <div className="page-header">
        <h1>My Campaign Participations</h1>
        <p className="subtitle">Track all your contributions and donations</p>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="filter-section">
        <label>Filter by Type:</label>
        <select value={filter} onChange={(e) => setFilter(e.target.value)}>
          <option value="all">All Participations</option>
          <option value="money">Money Donations</option>
          <option value="item">Item Donations</option>
        </select>
      </div>

      {filteredParticipations.length === 0 ? (
        <div className="empty-state">
          <p>You haven't participated in any campaigns yet</p>
          <button
            className="btn-primary"
            onClick={() => navigate("/donor/campaigns")}
          >
            Browse Active Campaigns
          </button>
        </div>
      ) : (
        <div className="participations-list">
          {filteredParticipations.map((p, idx) => (
            <div key={idx} className="participation-card">
              <div className="type-badge">
                {p.participation_type === "money" ? "💰 Money" : "📦 Items"}
              </div>

              <div className="participation-content">
                <h3>{p.campaign_title}</h3>
                <p className="ngo-name">by {p.ngo_name}</p>

                <div className="contribution">
                  {p.participation_type === "money" ? (
                    <div>
                      <span className="amount">₹ {p.amount}</span>
                      <small>Amount Donated</small>
                    </div>
                  ) : (
                    <div>
                      <p>{p.items_description}</p>
                      <small>Items Donated</small>
                    </div>
                  )}
                </div>

                <div className="footer">
                  <small>
                    Participated on {new Date(p.participated_at).toLocaleDateString()}
                  </small>
                  <button
                    className="btn-view-action"
                    onClick={() => {
                      const cid = p.campaign_id || p.campaign;
                      if (cid) {
                        navigate(`/donor/campaigns/${cid}`);
                      } else {
                        console.error("Navigation failed: campaign_id and campaign are missing", p);
                        alert("Error: Campaign details are currently unavailable.");
                      }
                    }}
                  >
                    View Campaign →
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
