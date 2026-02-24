import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaArrowLeft } from "react-icons/fa";

export default function MyDonations() {
  const navigate = useNavigate();
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchDonations = async () => {
      try {
        const token = localStorage.getItem("access_token");

        const res = await fetch("http://127.0.0.1:8000/api/my-donations/", {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (!res.ok) throw new Error("Failed to fetch donations");

        const data = await res.json();
        setDonations(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchDonations();
  }, []);

  return (
    <div style={styles.container}>
      <div style={styles.backDashboardContainer}>
        <button onClick={() => navigate("/donor/dashboard")} style={styles.btnBackDashboard}>
          <FaArrowLeft /> Back to Dashboard
        </button>
      </div>

      <h2 style={styles.heading}>My Donations</h2>

      {loading && <p>Loading...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}

      {!loading && donations.length === 0 && <p>No donations found.</p>}

      {!loading && donations.length > 0 && (
        <table style={styles.table}>
          <thead>
            <tr>
              <th>NGO</th>
              <th>Type</th>
              <th>Amount / Items</th>
              <th>Payment</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {donations.map((d) => (
              <tr key={d.id}>
                <td>{d.ngo_name}</td>
                <td>{d.type}</td>
                <td>{d.type === "money" ? `₹ ${d.amount}` : d.items}</td>
                <td>{d.type === "item" ? "N/A" : "UPI"}</td>
                <td>{new Date(d.created_at).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

/* --- styles ONLY for this page --- */
const styles = {
  container: {
    minHeight: "100vh",
    background: "#FFF3F4",
    padding: "40px",
    fontFamily: "Segoe UI, sans-serif",
  },
  heading: {
    color: "#C97A7A",
    marginBottom: "20px",
  },
  table: {
    width: "100%",
    background: "#fff",
    borderCollapse: "collapse",
    borderRadius: "12px",
    overflow: "hidden",
  },
  backDashboardContainer: {
    marginBottom: "20px",
  },
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
};
