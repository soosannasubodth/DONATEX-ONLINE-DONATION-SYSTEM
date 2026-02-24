import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaArrowLeft } from "react-icons/fa";

export default function ViewDonations() {
  const navigate = useNavigate();
  const [donations, setDonations] = useState([]);
  const [totals, setTotals] = useState({ count: 0, total_amount: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filters, setFilters] = useState({ donor: "", start_date: "", end_date: "" });

  const fetchDonations = async (qs = {}) => {
    setLoading(true);
    setError("");

    const token = localStorage.getItem("access_token");
    if (!token) {
      navigate("/login");
      return;
    }

    const params = new URLSearchParams();
    if (qs.donor) params.append("donor", qs.donor);
    if (qs.start_date) params.append("start_date", qs.start_date);
    if (qs.end_date) params.append("end_date", qs.end_date);

    try {
      const res = await fetch("http://127.0.0.1:8000/api/ngo/donations/" + (params.toString() ? `?${params}` : ""), {
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.detail || "Failed to load donations");
      }

      const data = await res.json();

      // API returns { totals: {...}, donations: [...] }
      setTotals(data.totals || { count: 0, total_amount: 0 });
      setDonations(data.donations || []);
      setLoading(false);
    } catch (err) {
      setError(err.message || "Unable to load donations");
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDonations(filters);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const applyFilters = () => {
    fetchDonations(filters);
  };

  const clearFilters = () => {
    const empty = { donor: "", start_date: "", end_date: "" };
    setFilters(empty);
    fetchDonations(empty);
  };

  return (
    <div style={styles.container}>
      <div style={styles.backDashboardContainer}>
        <button onClick={() => navigate("/ngo-dashboard")} style={styles.btnBackDashboard}>
          <FaArrowLeft /> Back to Dashboard
        </button>
      </div>

      <h2 style={styles.heading}>Received Donations</h2>

      <div style={styles.summary}>
        <div><b>Total Donations:</b> {totals.count}</div>
        <div><b>Total Amount:</b> ₹{totals.total_amount}</div>
      </div>

      <div style={styles.filters}>
        <input name="donor" placeholder="Search donor name" value={filters.donor} onChange={handleChange} style={styles.input} />
        <label style={styles.label}>From: <input type="date" name="start_date" value={filters.start_date} onChange={handleChange} style={styles.dateInput} /></label>
        <label style={styles.label}>To: <input type="date" name="end_date" value={filters.end_date} onChange={handleChange} style={styles.dateInput} /></label>
        <button onClick={applyFilters} style={styles.filterBtn}>Apply</button>
        <button onClick={clearFilters} style={styles.clearBtn}>Clear</button>
      </div>

      {loading && <p>Loading...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}

      {!loading && donations.length === 0 && <p>No donations found.</p>}

      {!loading && donations.length > 0 && (
        <table style={styles.table}>
          <thead>
            <tr>
              <th>Donor</th>
              <th>Type</th>
              <th>Amount / Items</th>
              <th>Payment</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {donations.map((d) => (
              <tr key={d.id}>
                <td>{d.donor_name}</td>
                <td>{d.type}</td>
                <td>{d.type === "money" ? `₹${d.amount}` : d.items}</td>
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

const styles = {
  container: { minHeight: "100vh", padding: "30px", background: "#FFF3F4", fontFamily: "Segoe UI, sans-serif" },
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
  summary: { display: "flex", gap: "20px", marginBottom: "20px" },
  filters: { display: "flex", gap: "10px", alignItems: "center", marginBottom: "25px", flexWrap: "wrap" },
  input: { padding: "10px", borderRadius: "8px", border: "1px solid #ddd", fontSize: "14px" },
  dateInput: { padding: "8px", borderRadius: "8px", border: "1px solid #ddd", fontSize: "14px" },
  filterBtn: { padding: "10px 20px", background: "#C97A7A", color: "#fff", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: "600" },
  clearBtn: { padding: "10px 20px", background: "#eee", color: "#333", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: "600" },
  table: { width: "100%", borderCollapse: "collapse", background: "#fff", borderRadius: "12px", overflow: "hidden", boxShadow: "0 4px 15px rgba(0,0,0,0.05)" },
  label: { fontSize: "13px", color: "#666", display: "flex", alignItems: "center", gap: "6px" }
};
