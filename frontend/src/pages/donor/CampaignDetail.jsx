import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FaArrowLeft } from "react-icons/fa";
import "./CampaignDetail.css";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

export default function CampaignDetail() {
  const { campaignId } = useParams();
  const navigate = useNavigate();
  const token = localStorage.getItem("access_token");
  const userRole = localStorage.getItem("role");

  const [campaign, setCampaign] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showParticipateForm, setShowParticipateForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [participationType, setParticipationType] = useState("money");
  const [amount, setAmount] = useState("");
  const [itemsDescription, setItemsDescription] = useState("");

  useEffect(() => {
    if (campaignId && campaignId !== "undefined") {
      fetchCampaignDetail();
    }
  }, [campaignId]);

  const fetchCampaignDetail = async () => {
    if (!campaignId || campaignId === "undefined") {
      console.error("fetchCampaignDetail called with invalid ID:", campaignId);
      return;
    }
    try {
      const response = await fetch(`${API_URL}/api/campaigns/${campaignId}/`);
      if (!response.ok) throw new Error("Failed to fetch campaign");

      const data = await response.json();
      setCampaign(data);
      setParticipants(data.participants || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleParticipate = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    if (participationType === "money" && !amount) {
      setError("Please enter an amount");
      setSubmitting(false);
      return;
    }

    if (participationType === "item" && !itemsDescription) {
      setError("Please describe the items");
      setSubmitting(false);
      return;
    }

    // Participate directly without payment
    await participateInCampaign();
  };

  const participateInCampaign = async () => {
    try {
      // If money donation, initiate Razorpay payment
      if (participationType === "money") {
        // Step 1: Create order
        const orderResponse = await fetch(
          `${API_URL}/api/payments/create-order/`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              amount: parseFloat(amount),
              currency: "INR",
            }),
          }
        );

        if (!orderResponse.ok) {
          throw new Error("Failed to create payment order");
        }

        const orderData = await orderResponse.json();

        // Step 2: Open Razorpay modal
        const options = {
          key: orderData.key_id,
          amount: orderData.amount,
          currency: orderData.currency,
          name: "DonateX",
          description: `Participate in ${campaign.title}`,
          order_id: orderData.order_id,
          handler: async function (response) {
            // Step 3: Verify payment
            try {
              const verifyResponse = await fetch(
                `${API_URL}/api/payments/verify/`,
                {
                  method: "POST",
                  headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                  },
                  body: JSON.stringify({
                    razorpay_order_id: response.razorpay_order_id,
                    razorpay_payment_id: response.razorpay_payment_id,
                    razorpay_signature: response.razorpay_signature,
                    donation_type: "campaign",
                    campaign_id: campaignId,
                    participation_type: "money",
                  }),
                }
              );

              if (!verifyResponse.ok) {
                throw new Error("Payment verification failed");
              }

              alert("Thank you for participating! Payment successful.");
              setShowParticipateForm(false);
              setAmount("");
              setSubmitting(false);
              fetchCampaignDetail();
            } catch (err) {
              setError(err.message);
              setSubmitting(false);
            }
          },
          prefill: {
            name: localStorage.getItem("username") || "",
            email: localStorage.getItem("email") || "",
          },
          theme: {
            color: "#C97A7A",
          },
          modal: {
            ondismiss: function () {
              setSubmitting(false);
            },
          },
        };

        const razorpay = new window.Razorpay(options);
        razorpay.open();
      } else {
        // Item donation - use existing logic
        const body = {
          participation_type: participationType,
          amount: participationType === "money" ? parseFloat(amount) : null,
          items_description: participationType === "item" ? itemsDescription : null,
        };

        const response = await fetch(
          `${API_URL}/api/campaigns/${campaignId}/participate/`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify(body),
          }
        );

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.detail || "Failed to participate");
        }

        alert("Thank you for participating!");
        setShowParticipateForm(false);
        setAmount("");
        setItemsDescription("");
        setSubmitting(false);
        fetchCampaignDetail();
      }
    } catch (err) {
      setError(err.message);
      setSubmitting(false);
    }
  };

  if (loading) return <div className="loading">Loading campaign details...</div>;

  if (!campaign)
    return (
      <div className="error-container">
        <p>Campaign not found</p>
        <button onClick={() => navigate("/donor/campaigns")}>
          Back to Campaigns
        </button>
      </div>
    );

  const progressPercent = campaign.goal_amount
    ? Math.min((campaign.total_amount_raised / campaign.goal_amount) * 100, 100)
    : 0;

  return (
    <div className="campaign-detail-container">
      <div className="back-dashboard-container">
        <button onClick={() => navigate("/donor/dashboard")} className="btn-back-dashboard">
          <FaArrowLeft /> Back to Dashboard
        </button>
      </div>

      <button className="btn-back" onClick={() => navigate(-1)}>
        ← Back
      </button>

      {error && <div className="error-message">{error}</div>}

      <div className="campaign-hero">
        {campaign.image_url && <img src={campaign.image_url} alt={campaign.title} />}
        <div className="hero-overlay">
          <h1>{campaign.title}</h1>
          <p className="ngo-info">by {campaign.ngo_name}</p>
        </div>
      </div>

      <div className="campaign-body-layout">
        <div className="campaign-main-content">
          <div className="campaign-section">
            <h2>About This Campaign</h2>
            <p>{campaign.description}</p>
          </div>

          {campaign.goal_items && (
            <div className="campaign-section">
              <h3>Items Needed</h3>
              <p>{campaign.goal_items}</p>
            </div>
          )}

          {campaign.goal_amount && (
            <div className="section funding">
              <h2>Funding Progress</h2>
              <div className="progress-container">
                <div className="progress-bar">
                  <div
                    className="progress-fill"
                    style={{ width: `${progressPercent}%` }}
                  ></div>
                </div>
                <div className="progress-stats">
                  <div className="stat-item">
                    <span className="amount">₹ {campaign.total_amount_raised.toFixed(2)}</span>
                    <small>Raised</small>
                  </div>
                  <div className="stat-item">
                    <span className="amount">₹ {campaign.goal_amount}</span>
                    <small>Goal</small>
                  </div>
                  <div className="stat-item">
                    <span className="amount">{progressPercent.toFixed(0)}%</span>
                    <small>Complete</small>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="section timeline">
            <h3>Campaign Timeline</h3>
            <div className="timeline-items">
              <div className="timeline-item">
                <span className="label">Start Date</span>
                <span className="value">
                  {new Date(campaign.start_date).toLocaleString()}
                </span>
              </div>
              <div className="timeline-item">
                <span className="label">End Date</span>
                <span className="value">
                  {new Date(campaign.end_date).toLocaleString()}
                </span>
              </div>
              <div className="timeline-item">
                <span className="label">Status</span>
                <span className="value status">{campaign.status.toUpperCase()}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="campaign-sidebar">
          {userRole === "donor" && (
            <div className="participate-card">
              {!showParticipateForm ? (
                <button
                  className="btn-primary btn-large"
                  onClick={() => setShowParticipateForm(true)}
                >
                  Participate in Campaign
                </button>
              ) : (
                <form onSubmit={handleParticipate}>
                  <h3>How would you like to help?</h3>

                  <div className="form-group">
                    <label>
                      <input
                        type="radio"
                        value="money"
                        checked={participationType === "money"}
                        onChange={(e) => setParticipationType(e.target.value)}
                      />
                      Donate Money
                    </label>
                  </div>

                  <div className="form-group">
                    <label>
                      <input
                        type="radio"
                        value="item"
                        checked={participationType === "item"}
                        onChange={(e) => setParticipationType(e.target.value)}
                      />
                      Donate Items
                    </label>
                  </div>

                  {participationType === "money" ? (
                    <div className="form-group">
                      <input
                        type="number"
                        placeholder="Amount (₹)"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        step="0.01"
                        min="0"
                        required
                      />
                    </div>
                  ) : (
                    <div className="form-group">
                      <textarea
                        placeholder="Describe what you're donating"
                        value={itemsDescription}
                        onChange={(e) => setItemsDescription(e.target.value)}
                        rows="3"
                        required
                      ></textarea>
                    </div>
                  )}

                  <div className="form-actions">
                    <button
                      type="submit"
                      className="btn-submit"
                      disabled={submitting}
                    >
                      {submitting ? "Processing..." : "Confirm"}
                    </button>
                    <button
                      type="button"
                      className="btn-cancel"
                      onClick={() => setShowParticipateForm(false)}
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}

          <div className="stats-card">
            <h3>Campaign Stats</h3>
            <div className="stat-row">
              <span>Total Participants</span>
              <strong>{campaign.participant_count}</strong>
            </div>
            <div className="stat-row">
              <span>Funds Raised</span>
              <strong>₹ {campaign.total_amount_raised.toFixed(2)}</strong>
            </div>
          </div>
        </div>
      </div>

      {participants.length > 0 && (
        <div className="participants-section">
          <h2>Recent Participants</h2>
          <div className="participants-list">
            {participants.slice(0, 10).map((p, idx) => (
              <div key={idx} className="participant-item">
                <div className="participant-info">
                  <strong>{p.donor_name}</strong>
                  <small>
                    {p.participation_type === "money"
                      ? `₹ ${p.amount}`
                      : "Items: " + p.items_description}
                  </small>
                </div>
                <small>{new Date(p.participated_at).toLocaleDateString()}</small>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
