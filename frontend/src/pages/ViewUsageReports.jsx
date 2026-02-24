import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function ViewUsageReports() {
  const navigate = useNavigate();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [expandedId, setExpandedId] = useState(null);

  useEffect(() => {
    fetch("http://127.0.0.1:8000/api/reports/verified/")
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
  }, []);

  return (
    <div style={styles.container}>
      <h2 style={styles.heading}>Verified Utilization Reports</h2>

      <button style={styles.backBtn} onClick={() => navigate("/")}>
        ← Back
      </button>

      {loading && <p>Loading...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}

      {!loading && reports.length === 0 && <p>No verified reports yet.</p>}

      {!loading && reports.length > 0 && (
        <div style={styles.reportsList}>
          {reports.map((report) => (
            <div key={report.id} style={styles.reportCard}>
              <div
                style={styles.reportHeader}
                onClick={() => setExpandedId(expandedId === report.id ? null : report.id)}
              >
                <div>
                  <h4 style={styles.reportTitle}>{report.title}</h4>
                  <p style={styles.reportMeta}>
                    {report.donation_id ? `Donation #${report.donation_id}` : "Report"} | Verified:{" "}
                    {new Date(report.verified_at).toLocaleDateString()}
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
                      <b>Attached Proofs:</b>
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

                  <p style={styles.verifiedBadge}>✓ Verified</p>
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
  container: { padding: "30px", background: "#FDF6F6", minHeight: "100vh", fontFamily: "Segoe UI" },
  heading: { color: "#C97A7A", marginBottom: "10px" },
  backBtn: { marginBottom: "16px", padding: "8px 12px", border: "none", borderRadius: "6px", background: "#C97A7A", color: "#fff", cursor: "pointer" },
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
  verifiedBadge: { marginTop: "12px", color: "#4CAF50", fontWeight: "bold" },
};
