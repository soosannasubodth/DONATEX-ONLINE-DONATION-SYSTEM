import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FaArrowLeft } from "react-icons/fa";
import "./AdminTicketDetail.css";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

export default function AdminTicketDetail() {
  const { ticketId } = useParams();
  const navigate = useNavigate();
  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [attachment, setAttachment] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const token = localStorage.getItem("access_token");

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

  const handlePostMessage = async (e) => {
    e.preventDefault();
    if (!message.trim() && !attachment) {
      alert("Please enter a message or attach a file");
      return;
    }

    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("message", message);
      if (attachment) formData.append("attachment", attachment);

      const response = await fetch(
        `${API_URL}/api/admin/tickets/${ticketId}/messages/`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
          body: formData,
        }
      );

      if (!response.ok) throw new Error("Failed to post message");
      const newMessage = await response.json();

      setTicket({
        ...ticket,
        messages: [...ticket.messages, newMessage],
      });
      setMessage("");
      setAttachment(null);
      alert("Message posted successfully");
    } catch (err) {
      alert("Error: " + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleChangeStatus = async (newStatus) => {
    try {
      const response = await fetch(
        `${API_URL}/api/admin/tickets/${ticketId}/status/`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ status: newStatus }),
        }
      );

      if (!response.ok) throw new Error("Failed to update status");
      const updatedTicket = await response.json();
      setTicket(updatedTicket);
      alert("Ticket status updated");
    } catch (err) {
      alert("Error: " + err.message);
    }
  };

  if (loading) return <div className="admin-ticket-detail">Loading...</div>;
  if (error) return <div className="admin-ticket-detail error-message">{error}</div>;
  if (!ticket) return <div className="admin-ticket-detail">Ticket not found</div>;

  return (
    <div className="admin-ticket-detail">
      <div className="back-dashboard-container">
        <button onClick={() => navigate("/admin-dashboard")} className="btn-back-dashboard">
          <FaArrowLeft /> Back to Dashboard
        </button>
      </div>

      <button className="btn-back" onClick={() => navigate(-1)}>
        ← Back
      </button>

      <div className="ticket-header-admin">
        <div>
          <h1>#{ticket.id} {ticket.title}</h1>
          <p className="ticket-meta">
            Raised by: <strong>{ticket.user_name}</strong> on{" "}
            {new Date(ticket.created_at).toLocaleDateString()}
          </p>
        </div>
        <div className="status-controls">
          <span className={`status-badge status-${ticket.status}`}>
            {ticket.status.toUpperCase()}
          </span>
          {ticket.status === "open" ? (
            <button
              className="btn-close"
              onClick={() => handleChangeStatus("closed")}
            >
              Close Ticket
            </button>
          ) : (
            <button
              className="btn-reopen"
              onClick={() => handleChangeStatus("open")}
            >
              Reopen Ticket
            </button>
          )}
        </div>
      </div>

      <div className="ticket-content-admin">
        <div className="issue-section">
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
                    <a
                      href={msg.attachment_url}
                      className="attachment-link"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      📎 View Attachment
                    </a>
                  )}
                </div>
              ))
            ) : (
              <p className="no-messages">No messages yet in this ticket.</p>
            )}
          </div>
        </div>

        {ticket.status === "open" && (
          <form className="reply-form" onSubmit={handlePostMessage}>
            <h3>Post Reply</h3>
            <div className="form-group">
              <label>Message</label>
              <textarea
                placeholder="Type your response..."
                rows="5"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
              ></textarea>
            </div>
            <div className="form-group">
              <label>Attachment (optional)</label>
              <input
                type="file"
                onChange={(e) => setAttachment(e.target.files[0])}
              />
            </div>
            <button
              type="submit"
              className="btn-primary"
              disabled={submitting}
            >
              {submitting ? "Posting..." : "Post Reply"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
