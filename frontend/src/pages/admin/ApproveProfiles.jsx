import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaArrowLeft } from "react-icons/fa";

export default function ApproveProfiles() {
  const navigate = useNavigate();
  const [pending, setPending] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const role = localStorage.getItem("role");
    if (role !== "admin") {
      navigate("/login");
    } else {
      fetchPending();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigate]);

  const fetchPending = async () => {
    setLoading(true);
    setError("");
    try {
      const token = localStorage.getItem("access_token");
      const res = await fetch("http://127.0.0.1:8000/api/admin/ngos/pending/", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to fetch pending NGOs");
      const data = await res.json();
      setPending(data);
    } catch (err) {
      setError(err.message || "Server error");
    } finally {
      setLoading(false);
    }
  };

  const changeStatus = async (ngoId, status) => {
    try {
      const token = localStorage.getItem("access_token");
      const res = await fetch(`http://127.0.0.1:8000/api/admin/ngos/${ngoId}/status/`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ status }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.detail || "Failed to update status");
      }

      // Remove from pending list
      setPending((p) => p.filter((n) => n.id !== ngoId));
      alert(`NGO ${status === "approved" ? "approved" : "rejected"} successfully`);
    } catch (err) {
      alert(err.message || "Error");
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.backDashboardContainer}>
        <button onClick={() => navigate("/admin-dashboard")} style={styles.btnBackDashboard}>
          <FaArrowLeft /> Back to Dashboard
        </button>
      </div>

      <div style={styles.header}>
        <h1 style={styles.heading}>Approve NGO Profiles</h1>
      </div>

      {loading && <p style={styles.loading}>Loading pending NGOs...</p>}
      {error && <p style={styles.error}>{error}</p>}

      {pending.length === 0 && !loading && (
        <p style={styles.noPending}>No pending NGO profiles to review.</p>
      )}

      <div style={styles.gridContainer}>
        {pending.map((ngo) => (
          <div key={ngo.id} style={styles.card}>
            {/* Logo Section */}
            <div style={styles.logoSection}>
              {ngo.logo ? (
                <img
                  src={
                    ngo.logo.startsWith("http")
                      ? ngo.logo
                      : `http://127.0.0.1:8000${ngo.logo}`
                  }
                  alt={ngo.name}
                  style={styles.logoImage}
                  onError={(e) => (e.target.src = "https://via.placeholder.com/150")}
                />
              ) : (
                <div style={styles.placeholderLogo}>No Logo</div>
              )}
            </div>

            {/* Info Section */}
            <div style={styles.infoSection}>
              <h3 style={styles.ngoName}>{ngo.name}</h3>
              <p style={styles.description}>{ngo.description}</p>
              <p style={styles.category}>
                <strong>Category:</strong> {ngo.category}
              </p>
              <p style={styles.submittedAt}>
                <strong>Submitted:</strong>{" "}
                {(() => {
                  const d = ngo.created_at ? new Date(ngo.created_at) : null;
                  return d && !isNaN(d.getTime()) ? d.toLocaleDateString() : "Unknown";
                })()}
              </p>
            </div>

            {/* Actions Section */}
            <div style={styles.actionSection}>
              <button
                onClick={() => changeStatus(ngo.id, "approved")}
                style={styles.approveButton}
              >
                ✓ Approve
              </button>
              <button
                onClick={() => changeStatus(ngo.id, "rejected")}
                style={styles.rejectButton}
              >
                ✗ Reject
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

const styles = {
  container: {
    padding: 30,
    maxWidth: 1200,
    margin: "0 auto",
    background: "#FDF6F6",
    minHeight: "100vh",
    fontFamily: "Segoe UI, sans-serif",
  },
  backDashboardContainer: { marginBottom: "20px" },
  btnBackDashboard: {
    background: "none",
    border: "1px solid #C97A7A",
    color: "#C97A7A",
    padding: "8px 16px",
    borderRadius: "20px",
    fontSize: "14px",
    fontWeight: "600",
    cursor: "pointer",
    display: "inline-flex",
    alignItems: "center",
    gap: "8px",
    transition: "all 0.3s ease",
    fontFamily: "inherit",
  },
  header: {
    marginBottom: 24,
    borderBottom: "2px solid #C97A7A",
    paddingBottom: 12,
  },
  heading: { color: "#C97A7A", margin: 0, fontWeight: "700" },
  loading: {
    textAlign: "center",
    color: "#666",
    fontSize: 16,
  },
  error: {
    color: "red",
    padding: 12,
    backgroundColor: "#ffe0e0",
    borderRadius: 6,
    marginBottom: 16,
  },
  noPending: {
    textAlign: "center",
    color: "#999",
    padding: 32,
  },
  gridContainer: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(350px, 1fr))",
    gap: 16,
  },
  card: {
    border: "1px solid #e0e0e0",
    borderRadius: 8,
    overflow: "hidden",
    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
    display: "flex",
    flexDirection: "column",
    backgroundColor: "#fff",
  },
  logoSection: {
    height: 200,
    backgroundColor: "#f5f5f5",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    borderBottom: "1px solid #e0e0e0",
  },
  logoImage: {
    maxWidth: "100%",
    maxHeight: "100%",
    objectFit: "contain",
  },
  placeholderLogo: {
    color: "#999",
    fontStyle: "italic",
    fontSize: 14,
  },
  infoSection: {
    padding: 16,
    flex: 1,
  },
  ngoName: {
    margin: 0,
    marginBottom: 8,
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  description: {
    margin: "8px 0",
    fontSize: 14,
    color: "#555",
    lineHeight: 1.4,
  },
  category: {
    margin: "8px 0",
    fontSize: 13,
    color: "#C97C7A",
  },
  submittedAt: {
    margin: "8px 0",
    fontSize: 12,
    color: "#999",
  },
  actionSection: {
    padding: "12px 16px",
    display: "flex",
    gap: 8,
    borderTop: "1px solid #e0e0e0",
    backgroundColor: "#fafafa",
  },
  approveButton: {
    flex: 1,
    padding: "10px 12px",
    backgroundColor: "#4CAF50",
    color: "#fff",
    border: "none",
    borderRadius: 6,
    cursor: "pointer",
    fontWeight: "bold",
    fontSize: 14,
    transition: "background-color 0.2s",
  },
  rejectButton: {
    flex: 1,
    padding: "10px 12px",
    backgroundColor: "#f44336",
    color: "#fff",
    border: "none",
    borderRadius: 6,
    cursor: "pointer",
    fontWeight: "bold",
    fontSize: 14,
    transition: "background-color 0.2s",
  },
};
