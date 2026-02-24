import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaArrowLeft } from "react-icons/fa";

export default function VerifyReports() {
  const navigate = useNavigate();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [expandedId, setExpandedId] = useState(null);
  const [verifyingId, setVerifyingId] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (!token) {
      navigate("/login");
      return;
    }

    fetch("http://127.0.0.1:8000/api/reports/pending/", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load reports");
        return res.json();
      })
      .then((data) => {
        setReports(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message || "Unable to load reports");
        setLoading(false);
      });
  }, [navigate]);

  const handleVerify = async (reportId, action) => {
    const token = localStorage.getItem("access_token");
    setVerifyingId(reportId);

    try {
      const res = await fetch(`http://127.0.0.1:8000/api/reports/${reportId}/verify/`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });

      if (!res.ok) throw new Error("Failed to verify");

      const updated = await res.json();
      setReports(reports.filter((r) => r.id !== reportId));
      alert(`Report ${action}d successfully!`);
    } catch (err) {
      alert(err.message || "Error verifying report");
    } finally {
      setVerifyingId(null);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.backDashboardContainer}>
        <button onClick={() => navigate("/admin-dashboard")} style={styles.btnBackDashboard}>
          <FaArrowLeft /> Back to Dashboard
        </button>
      </div>

      <h2 style={styles.heading}>Verify Utilization Reports</h2>

      {loading && <p>Loading...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}

      {!loading && reports.length === 0 && <p>No pending reports.</p>}

      {!loading && reports.length > 0 && (
        <div style={styles.reportsList}>
          {reports.map((report) => (
            <div key={report.id} style={styles.reportCard}>
              <div style={styles.reportHeader} onClick={() => setExpandedId(expandedId === report.id ? null : report.id)}>
                <div>
                  <h4 style={styles.reportTitle}>{report.title}</h4>
                  <p style={styles.reportMeta}>
                    Donation: ₹{report.amount_used || report.items_used} | {new Date(report.created_at).toLocaleDateString()}
                  </p>
                </div>
                <span style={styles.expandIcon}>{expandedId === report.id ? "▼" : "▶"}</span>
              </div>

              {expandedId === report.id && (
                <div style={styles.reportDetails}>
                  <p>
                    <b>Description:</b> {report.description}
                  </p>

                  {report.amount_used && (
                    <p>
                      <b>Amount Used:</b> ₹{report.amount_used}
                    </p>
                  )}

                  {report.items_used && (
                    <p>
                      <b>Items Used:</b> {report.items_used}
                    </p>
                  )}

                  {report.proofs && report.proofs.length > 0 && (
                    <div style={styles.proofsSection}>
                      <b>Proofs:</b>
                      <div style={styles.proofsList}>
                        {report.proofs.map((proof) => (
                          <div key={proof.id} style={styles.proof}>
                            {proof.caption && <p style={styles.caption}>{proof.caption}</p>}
                            <a href={proof.file_url} target="_blank" rel="noreferrer" style={styles.proofLink}>
                              📄 {proof.file.split("/").pop()}
                            </a>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div style={styles.actionButtons}>
                    <button
                      onClick={() => handleVerify(report.id, "verify")}
                      disabled={verifyingId === report.id}
                      style={styles.verifyBtn}
                    >
                      ✓ Verify
                    </button>
                    <button
                      onClick={() => handleVerify(report.id, "reject")}
                      disabled={verifyingId === report.id}
                      style={styles.rejectBtn}
                    >
                      ✗ Reject
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const styles = {
  container: { padding: "30px", background: "#FDF6F6", minHeight: "100vh", fontFamily: "Segoe UI, sans-serif" },
  heading: { color: "#C97A7A", marginBottom: "20px", fontWeight: "700" },
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
  reportsList: { display: "flex", flexDirection: "column", gap: "12px" },
  reportCard: { background: "#fff", borderRadius: "8px", border: "1px solid #E6B6B6" },
  reportHeader: { padding: "12px", cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center" },
  reportTitle: { margin: 0, color: "#8A3F3F", fontSize: "16px" },
  reportMeta: { margin: "4px 0 0 0", fontSize: "12px", color: "#666" },
  expandIcon: { fontSize: "14px", color: "#999" },
  reportDetails: { padding: "12px", borderTop: "1px solid #E6B6B6", fontSize: "14px" },
  proofsSection: { marginTop: "12px" },
  proofsList: { display: "flex", flexDirection: "column", gap: "6px", marginTop: "6px" },
  proof: { background: "#F9F9F9", padding: "6px", borderRadius: "4px" },
  caption: { margin: "0 0 4px 0", fontSize: "12px", color: "#666" },
  proofLink: { color: "#C97A7A", textDecoration: "none" },
  actionButtons: { display: "flex", gap: "8px", marginTop: "12px" },
  verifyBtn: { flex: 1, padding: "8px", background: "#4CAF50", color: "#fff", border: "none", borderRadius: "6px", cursor: "pointer" },
  rejectBtn: { flex: 1, padding: "8px", background: "#f44336", color: "#fff", border: "none", borderRadius: "6px", cursor: "pointer" },
};
