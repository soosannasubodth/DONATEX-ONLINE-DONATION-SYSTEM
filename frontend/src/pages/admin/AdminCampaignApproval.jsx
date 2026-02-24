import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaArrowLeft } from "react-icons/fa";
import "./AdminCampaignApproval.css";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

export default function AdminCampaignApproval() {
  const navigate = useNavigate();
  const token = localStorage.getItem("access_token");
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actioning, setActioning] = useState({});

  useEffect(() => {
    fetchPendingCampaigns();
  }, []);

  const fetchPendingCampaigns = async () => {
    try {
      const response = await fetch(
        `${API_URL}/api/admin/campaigns/pending/`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (!response.ok) throw new Error("Failed to fetch pending campaigns");

      const data = await response.json();
      setCampaigns(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleApproval = async (campaignId, action) => {
    setActioning((prev) => ({ ...prev, [campaignId]: true }));

    try {
      const response = await fetch(
        `${API_URL}/api/admin/campaigns/${campaignId}/approve/`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ action }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Action failed");
      }

      alert(`Campaign ${action}ed successfully!`);
      setCampaigns((prev) => prev.filter((c) => c.id !== campaignId));
    } catch (err) {
      alert(`Error: ${err.message}`);
    } finally {
      setActioning((prev) => ({ ...prev, [campaignId]: false }));
    }
  };

  if (loading) return <div className="loading">Loading pending campaigns...</div>;

  return (
    <div className="admin-approval-container">
      <div className="back-dashboard-container">
        <button onClick={() => navigate("/admin-dashboard")} className="btn-back-dashboard">
          <FaArrowLeft /> Back to Dashboard
        </button>
      </div>

      <div className="header">
        <h1>Campaign Approval Queue</h1>
        <p className="subtitle">Review and approve/reject NGO campaigns</p>
      </div>

      {error && <div className="error-message">{error}</div>}

      {campaigns.length === 0 ? (
        <div className="empty-state">
          <p>✓ No pending campaigns to review</p>
          <button className="btn-secondary" onClick={() => navigate("/admin")}>
            Back to Dashboard
          </button>
        </div>
      ) : (
        <div className="campaigns-table">
          <table>
            <thead>
              <tr>
                <th>Campaign Title</th>
                <th>NGO</th>
                <th>Duration</th>
                <th>Goal Amount</th>
                <th>Submitted</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {campaigns.map((campaign) => (
                <tr key={campaign.id}>
                  <td>
                    <strong>{campaign.title}</strong>
                    <br />
                    <small>{campaign.description.substring(0, 60)}...</small>
                  </td>
                  <td>{campaign.ngo_name}</td>
                  <td>
                    <small>
                      {new Date(campaign.start_date).toLocaleDateString()}
                      <br />
                      to {new Date(campaign.end_date).toLocaleDateString()}
                    </small>
                  </td>
                  <td>
                    {campaign.goal_amount ? (
                      <strong>₹ {campaign.goal_amount}</strong>
                    ) : (
                      <span>-</span>
                    )}
                  </td>
                  <td>
                    <small>{new Date(campaign.created_at).toLocaleDateString()}</small>
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button
                        className="btn-approve"
                        onClick={() => handleApproval(campaign.id, "approve")}
                        disabled={actioning[campaign.id]}
                      >
                        {actioning[campaign.id] ? "..." : "✓ Approve"}
                      </button>
                      <button
                        className="btn-reject"
                        onClick={() => handleApproval(campaign.id, "reject")}
                        disabled={actioning[campaign.id]}
                      >
                        {actioning[campaign.id] ? "..." : "✗ Reject"}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
