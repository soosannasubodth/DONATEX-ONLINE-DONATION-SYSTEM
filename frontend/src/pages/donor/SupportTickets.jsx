import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaArrowLeft } from "react-icons/fa";
import "./SupportTickets.css";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

export default function SupportTickets() {
  const navigate = useNavigate();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ title: "", description: "" });
  const [error, setError] = useState("");
  const token = localStorage.getItem("access_token");

  // Fetch tickets
  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    try {
      const response = await fetch(
        `${API_URL}/api/tickets/my/`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (!response.ok) throw new Error("Failed to fetch tickets");
      const data = await response.json();
      setTickets(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTicket = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.description) {
      alert("All fields are required");
      return;
    }

    try {
      const response = await fetch(
        `${API_URL}/api/tickets/`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(formData),
        }
      );

      if (!response.ok) throw new Error("Failed to create ticket");
      const newTicket = await response.json();
      setTickets([newTicket, ...tickets]);
      setFormData({ title: "", description: "" });
      setShowForm(false);
      alert("Ticket created successfully");
    } catch (err) {
      alert("Error: " + err.message);
    }
  };

  const handleViewTicket = (ticketId) => {
    navigate(`/donor/support/${ticketId}`);
  };

  if (loading) return <div className="support-container">Loading...</div>;

  return (
    <div className="support-container">
      <div className="back-dashboard-container">
        <button onClick={() => navigate("/donor/dashboard")} className="btn-back-dashboard">
          <FaArrowLeft /> Back to Dashboard
        </button>
      </div>

      <div className="support-header">
        <h1>Support Tickets</h1>
        <button
          className="btn-primary"
          onClick={() => setShowForm(!showForm)}
        >
          {showForm ? "Cancel" : "Create Ticket"}
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      {showForm && (
        <form className="ticket-form" onSubmit={handleCreateTicket}>
          <div className="form-group">
            <label>Title</label>
            <input
              type="text"
              placeholder="Brief issue title"
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
            />
          </div>
          <div className="form-group">
            <label>Description</label>
            <textarea
              placeholder="Describe your issue in detail"
              rows="5"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
            ></textarea>
          </div>
          <button type="submit" className="btn-primary">
            Submit Ticket
          </button>
        </form>
      )}

      <div className="tickets-list">
        {tickets.length === 0 ? (
          <p className="no-tickets">No tickets yet</p>
        ) : (
          tickets.map((ticket) => (
            <div key={ticket.id} className="ticket-card">
              <div className="ticket-header">
                <h3>#{ticket.id} {ticket.title}</h3>
                <span className={`status-badge status-${ticket.status}`}>
                  {ticket.status.toUpperCase()}
                </span>
              </div>
              <p className="ticket-description">{ticket.description}</p>
              <div className="ticket-footer">
                <small>Created: {new Date(ticket.created_at).toLocaleDateString()}</small>
                <button
                  className="btn-secondary"
                  onClick={() => handleViewTicket(ticket.id)}
                >
                  View Details
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
