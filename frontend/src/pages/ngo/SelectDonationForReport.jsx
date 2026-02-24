import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaArrowLeft } from "react-icons/fa";

export default function SelectDonationForReport() {
  const navigate = useNavigate();
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (!token) {
      navigate("/login");
      return;
    }

    fetch("http://127.0.0.1:8000/api/ngo/donations/", {
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    })
      .then(async (res) => {
        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.detail || "Failed to load donations");
        }
        return res.json();
      })
      .then((data) => {
        setDonations(data.donations || []);
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
        <button onClick={() => navigate("/ngo-dashboard")} style={styles.btnBackDashboard}>
          <FaArrowLeft /> Back to Dashboard
        </button>
      </div>

      <h2 style={styles.heading}>Select Donation to Report On</h2>

      {loading && <p>Loading...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}

      {!loading && donations.length === 0 && <p>No donations received yet.</p>}

      {!loading && donations.length > 0 && (
        <div style={styles.list}>
          {donations.map((donation) => (
            <div key={donation.id} style={styles.card}>
              <div>
                <p><b>Type:</b> {donation.type}</p>
                {donation.type === "money" && <p><b>Amount:</b> ₹{donation.amount}</p>}
                {donation.type === "item" && <p><b>Items:</b> {donation.items}</p>}
                <p><b>Date:</b> {new Date(donation.created_at).toLocaleDateString()}</p>
              </div>
              <button
                onClick={() => navigate(`/ngo/upload-report/${donation.id}`)}
                style={styles.uploadBtn}
              >
                Upload Report
              </button>
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
  list: { display: "flex", flexDirection: "column", gap: "12px" },
  card: { background: "#fff", padding: "16px", borderRadius: "8px", display: "flex", justifyContent: "space-between", alignItems: "center", boxShadow: "0 2px 8px rgba(0,0,0,0.06)" },
  uploadBtn: { padding: "8px 12px", background: "#C97A7A", color: "#fff", border: "none", borderRadius: "6px", cursor: "pointer", whiteSpace: "nowrap" },
};
