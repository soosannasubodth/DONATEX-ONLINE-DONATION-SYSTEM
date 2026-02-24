import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaArrowLeft } from "react-icons/fa";

export default function DonationUsage() {
  const navigate = useNavigate();
  const [donations, setDonations] = useState([]);
  const [reports, setReports] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [expandedId, setExpandedId] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (!token) {
      navigate("/login");
      return;
    }

    // First fetch donor's donations
    fetch("http://127.0.0.1:8000/api/my-donations/", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load donations");
        return res.json();
      })
      .then((donations) => {
        setDonations(donations);
        // Fetch reports for each donation
        donations.forEach((donation) => {
          fetch(`http://127.0.0.1:8000/api/donations/${donation.id}/reports/`, {
            headers: { Authorization: `Bearer ${token}` },
          })
            .then((res) => res.json())
            .then((data) => {
              setReports((prev) => ({ ...prev, [donation.id]: data }));
            });
        });
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message || "Unable to load donations");
        setLoading(false);
      });
  }, [navigate]);

  return (
    <div style={styles.container}>
      <div style={styles.backDashboardContainer}>
        <button onClick={() => navigate("/donor/dashboard")} style={styles.btnBackDashboard}>
          <FaArrowLeft /> Back to Dashboard
        </button>
      </div>

      <h2 style={styles.heading}>How Your Donations Were Used</h2>

      {loading && <p>Loading...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}

      {!loading && donations.length === 0 && <p>You haven't donated yet.</p>}

      {!loading && donations.length > 0 && (
        <div style={styles.donationsList}>
          {donations.map((donation) => {
            const donationReports = reports[donation.id] || [];
            return (
              <div key={donation.id} style={styles.donationCard}>
                <div style={styles.donationInfo}>
                  <p>
                    <b>Your Donation:</b> {donation.type === "money" ? `₹${donation.amount}` : donation.items}
                  </p>
                  <p style={styles.donationDate}>
                    Donated: {new Date(donation.created_at).toLocaleDateString()}
                  </p>
                  <p style={styles.ngoName}>
                    <b>NGO:</b> {donation.ngo_name}
                  </p>
                </div>

                {donationReports.length === 0 && (
                  <p style={styles.noReports}>⏳ No usage report yet. The NGO will submit one soon.</p>
                )}

                {donationReports.length > 0 && (
                  <div style={styles.reportsList}>
                    {donationReports.map((report) => (
                      <div key={report.id} style={styles.reportCard}>
                        <div
                          style={styles.reportHeader}
                          onClick={() => setExpandedId(expandedId === report.id ? null : report.id)}
                        >
                          <div>
                            <h5 style={styles.reportTitle}>{report.title}</h5>
                            <p style={styles.reportMeta}>
                              Verified: {new Date(report.verified_at).toLocaleDateString()}
                            </p>
                          </div>
                          <span style={styles.expandIcon}>{expandedId === report.id ? "▼" : "▶"}</span>
                        </div>

                        {expandedId === report.id && (
                          <div style={styles.reportDetails}>
                            <p>
                              <b>How it was used:</b> {report.description}
                            </p>

                            {report.amount_used && (
                              <p>
                                <b>Amount Spent:</b> ₹{report.amount_used}
                              </p>
                            )}

                            {report.items_used && (
                              <p>
                                <b>Items Used:</b> {report.items_used}
                              </p>
                            )}

                            {report.proofs && report.proofs.length > 0 && (
                              <div style={styles.proofsSection}>
                                <b>Supporting Evidence:</b>
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
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
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
  donationsList: { display: "flex", flexDirection: "column", gap: "16px" },
  donationCard: { background: "#fff", padding: "16px", borderRadius: "8px", border: "1px solid #E6B6B6" },
  donationInfo: { marginBottom: "12px" },
  donationDate: { margin: "4px 0", fontSize: "12px", color: "#666" },
  ngoName: { margin: "4px 0", color: "#8A3F3F" },
  noReports: { color: "#999", fontStyle: "italic", marginBottom: "0" },
  reportsList: { display: "flex", flexDirection: "column", gap: "8px" },
  reportCard: { background: "#F9F9F9", borderRadius: "6px", border: "1px solid #E0E0E0" },
  reportHeader: { padding: "10px", cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center" },
  reportTitle: { margin: 0, color: "#8A3F3F", fontSize: "14px" },
  reportMeta: { margin: "2px 0 0 0", fontSize: "11px", color: "#999" },
  expandIcon: { fontSize: "12px", color: "#999" },
  reportDetails: { padding: "10px", borderTop: "1px solid #E0E0E0", fontSize: "13px" },
  proofsSection: { marginTop: "8px" },
  proofsList: { display: "flex", flexDirection: "column", gap: "4px", marginTop: "4px" },
  proof: { background: "#fff", padding: "4px", borderRadius: "4px" },
  caption: { margin: "0 0 2px 0", fontSize: "11px", color: "#666" },
  proofLink: { color: "#C97A7A", textDecoration: "none", fontSize: "12px" },
};
