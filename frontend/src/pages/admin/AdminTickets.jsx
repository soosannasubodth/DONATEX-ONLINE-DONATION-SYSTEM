import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaArrowLeft } from "react-icons/fa";
import "./AdminTickets.css";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

export default function AdminTickets() {
  const navigate = useNavigate();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const token = localStorage.getItem("access_token");

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    try {
      const response = await fetch(
        `${API_URL}/api/admin/tickets/`,
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

  const handleViewTicket = (ticketId) => {
    navigate(`/admin/support/${ticketId}`);
  };

  const filteredTickets = filterStatus === "all"
    ? tickets
    : tickets.filter(t => t.status === filterStatus);

  if (loading) return <div className="admin-tickets-container">Loading...</div>;

  return (
    <div className="admin-tickets-container">
      <div className="back-dashboard-container">
        <button onClick={() => navigate("/admin-dashboard")} className="btn-back-dashboard">
          <FaArrowLeft /> Back to Dashboard
        </button>
      </div>

      <div className="tickets-header">
        <h1>Support Tickets</h1>
        <div className="filter-section">
          <label>Filter by Status:</label>
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
            <option value="all">All Tickets</option>
            <option value="open">Open</option>
            <option value="closed">Closed</option>
          </select>
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="tickets-table">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Title</th>
              <th>Raised By</th>
              <th>Status</th>
              <th>Created</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredTickets.length === 0 ? (
              <tr>
                <td colSpan="6" className="no-data">No tickets found</td>
              </tr>
            ) : (
              filteredTickets.map((ticket) => (
                <tr key={ticket.id}>
                  <td>#{ticket.id}</td>
                  <td className="title-cell">{ticket.title}</td>
                  <td>{ticket.user_name}</td>
                  <td>
                    <span className={`status-badge status-${ticket.status}`}>
                      {ticket.status.toUpperCase()}
                    </span>
                  </td>
                  <td>{new Date(ticket.created_at).toLocaleDateString()}</td>
                  <td>
                    <button
                      className="btn-view"
                      onClick={() => handleViewTicket(ticket.id)}
                    >
                      View & Reply
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
