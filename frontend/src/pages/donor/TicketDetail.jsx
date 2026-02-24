import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FaArrowLeft } from "react-icons/fa";
import "./TicketDetail.css";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

export default function TicketDetail() {
  const { ticketId } = useParams();
  const navigate = useNavigate();
  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const token = localStorage.getItem("access_token");
  const userRole = localStorage.getItem("role");

  useEffect(() => {
    fetchTicketDetail();
  }, [ticketId]);

  const fetchTicketDetail = async () => {
    try {
      const response = await fetch(
        `${API_URL}/api/tickets/${ticketId}/`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (!response.ok) throw new Error("Failed to fetch ticket");
      const data = await response.json();
      setTicket(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="ticket-detail-container">Loading...</div>;
  if (error) return <div className="ticket-detail-container error-message">{error}</div>;
  if (!ticket) return <div className="ticket-detail-container">Ticket not found</div>;

  return (
    <div className="ticket-detail-container">
      <div className="back-dashboard-container">
        <button onClick={() => navigate("/donor/dashboard")} className="btn-back-dashboard">
          <FaArrowLeft /> View All Tickets
        </button>
      </div>

      <button className="btn-back" onClick={() => navigate(-1)}>
        ← Back
      </button>

      <div className="ticket-header-detail">
        <div>
          <h1>#{ticket.id} {ticket.title}</h1>
          <p className="ticket-meta">
            Raised by: <strong>{ticket.user_name}</strong> on{" "}
            {new Date(ticket.created_at).toLocaleDateString()}
          </p>
        </div>
        <span className={`status-badge status-${ticket.status}`}>
          {ticket.status.toUpperCase()}
        </span>
      </div>

      <div className="ticket-content">
        <div className="ticket-description-section">
          <h3>Issue Description</h3>
          <p>{ticket.description}</p>
        </div>

        <div className="messages-section">
          <h3>Conversation Thread</h3>
          <div className="messages-list">
            {ticket.messages && ticket.messages.length > 0 ? (
              ticket.messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`message-item ${msg.sender_name === "Admin" ? "admin-message" : "user-message"
                    }`}
                >
                  <div className="message-header">
                    <strong>{msg.sender_name}</strong>
                    <small>{new Date(msg.created_at).toLocaleString()}</small>
                  </div>
                  <p>{msg.message}</p>
                  {msg.attachment_url && (
                    <a href={msg.attachment_url} className="attachment-link" target="_blank" rel="noopener noreferrer">
                      📎 View Attachment
                    </a>
                  )}
                </div>
              ))
            ) : (
              <p className="no-messages">No messages yet. Admin will reply soon.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
