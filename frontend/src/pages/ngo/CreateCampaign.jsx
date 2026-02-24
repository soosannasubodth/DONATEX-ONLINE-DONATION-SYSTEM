import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaArrowLeft } from "react-icons/fa";
import "./CreateCampaign.css";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

export default function CreateCampaign() {
  const navigate = useNavigate();
  const token = localStorage.getItem("access_token");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    goal_amount: "",
    goal_items: "",
    start_date: "",
    end_date: "",
  });
  const [image, setImage] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleImageChange = (e) => {
    setImage(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (!formData.title || !formData.description || !formData.start_date || !formData.end_date) {
      setError("Title, description, start date, and end date are required");
      setLoading(false);
      return;
    }

    try {
      const data = new FormData();
      data.append("title", formData.title);
      data.append("description", formData.description);
      data.append("goal_amount", formData.goal_amount || "");
      data.append("goal_items", formData.goal_items || "");
      data.append("start_date", formData.start_date);
      data.append("end_date", formData.end_date);
      if (image) data.append("image", image);

      const response = await fetch(`${API_URL}/api/campaigns/create/`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: data,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || "Failed to create campaign");
      }

      alert("Campaign created successfully and sent for approval!");
      navigate("/ngo/campaigns");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="create-campaign-container">
      <div className="back-dashboard-container">
        <button onClick={() => navigate("/ngo-dashboard")} className="btn-back-dashboard">
          <FaArrowLeft /> Back to Dashboard
        </button>
      </div>

      <button className="btn-back" onClick={() => navigate(-1)}>
        ← Back
      </button>

      <div className="form-card">
        <h1>Create New Campaign</h1>
        <p className="subtitle">Start a new campaign and wait for admin approval</p>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Campaign Title *</label>
            <input
              type="text"
              name="title"
              placeholder="e.g., School Supplies Drive"
              value={formData.title}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Description *</label>
            <textarea
              name="description"
              placeholder="Describe your campaign goal and impact"
              rows="5"
              value={formData.description}
              onChange={handleChange}
              required
            ></textarea>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Financial Goal (Optional)</label>
              <input
                type="number"
                name="goal_amount"
                placeholder="₹ Amount"
                value={formData.goal_amount}
                onChange={handleChange}
                step="0.01"
              />
            </div>

            <div className="form-group">
              <label>Items Needed (Optional)</label>
              <input
                type="text"
                name="goal_items"
                placeholder="e.g., 100 books, 50 uniforms"
                value={formData.goal_items}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Start Date *</label>
              <input
                type="datetime-local"
                name="start_date"
                value={formData.start_date}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label>End Date *</label>
              <input
                type="datetime-local"
                name="end_date"
                value={formData.end_date}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label>Campaign Image (Optional)</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
            />
            {image && <p className="file-selected">✓ {image.name}</p>}
          </div>

          <button
            type="submit"
            className="btn-primary"
            disabled={loading}
          >
            {loading ? "Creating..." : "Create Campaign"}
          </button>
        </form>
      </div>
    </div>
  );
}
