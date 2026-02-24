import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function NgoDonations() {
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
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    })
      .then(async (res) => {
        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.detail || "Failed to fetch donations");
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
      <h2 style={styles.heading}>Donations Received</h2>

      <button style={styles.backBtn} onClick={() => navigate("/ngo-dashboard")}>
        ← Back to Dashboard
      </button>

      {loading && <p>Loading...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}

      {!loading && donations.length === 0 && (
        <p>No donations received yet.</p>
      )}

      <div style={styles.list}>
        {donations.map((donation) => (
          <div key={donation.id} style={styles.card}>
            <p><b>Type:</b> {donation.type}</p>

            {donation.type === "money" && (
              <p><b>Amount:</b> ₹{donation.amount}</p>
            )}

            {donation.type === "item" && (
              <p><b>Items:</b> {donation.items}</p>
            )}

            <p><b>Payment:</b> {donation.payment_method}</p>
            <p style={styles.date}>
              {new Date(donation.created_at).toLocaleString()}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ---------- STYLES (ONLY FOR THIS PAGE) ---------- */

const styles = {
  container: {
    minHeight: "100vh",
    padding: "40px",
    background: "#FFF3F4",
    fontFamily: "Segoe UI",
  },
  heading: {
    color: "#C97A7A",
    marginBottom: "10px",
  },
  backBtn: {
    marginBottom: "25px",
    padding: "8px 16px",
    border: "none",
    borderRadius: "6px",
    background: "#C97A7A",
    color: "#fff",
    cursor: "pointer",
  },
  list: {
    display: "flex",
    flexWrap: "wrap",
    gap: "20px",
  },
  card: {
    background: "#fff",
    padding: "20px",
    borderRadius: "14px",
    width: "260px",
    boxShadow: "0 8px 20px rgba(0,0,0,0.1)",
    color: "#444",
  },
  date: {
    marginTop: "8px",
    fontSize: "13px",
    color: "#777",
  },
};
