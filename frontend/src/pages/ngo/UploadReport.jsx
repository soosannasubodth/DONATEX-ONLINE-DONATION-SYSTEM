import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { FaArrowLeft } from "react-icons/fa";

export default function UploadReport() {
  const navigate = useNavigate();
  const { donationId } = useParams();
  const [donation, setDonation] = useState(null);
  const [form, setForm] = useState({
    title: "",
    description: "",
    amount_used: "",
    items_used: "",
  });
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (!token) {
      navigate("/login");
      return;
    }

    // Fetch donation details
    fetch(`http://127.0.0.1:8000/api/ngo/donations/?donation_id=${donationId}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.donations && data.donations.length > 0) {
          setDonation(data.donations[0]);
        }
      })
      .catch(() => setError("Unable to load donation"));
  }, [donationId, navigate]);

  const handleInputChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    setFiles(Array.from(e.target.files));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    const token = localStorage.getItem("access_token");

    const formData = new FormData();
    formData.append("donation_id", donationId);
    formData.append("title", form.title);
    formData.append("description", form.description);
    if (form.amount_used) formData.append("amount_used", form.amount_used);
    if (form.items_used) formData.append("items_used", form.items_used);
    files.forEach((f) => formData.append("proofs", f));

    try {
      const res = await fetch("http://127.0.0.1:8000/api/reports/", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.detail || "Failed to upload report");
      }

      setSuccess("Report uploaded successfully!");
      setTimeout(() => navigate("/ngo-dashboard"), 2000);
    } catch (err) {
      setError(err.message || "Upload failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.backDashboardContainer}>
        <button onClick={() => navigate("/ngo-dashboard")} style={styles.btnBackDashboard}>
          <FaArrowLeft /> Back to Dashboard
        </button>
      </div>

      <h2 style={styles.heading}>Upload Utilization Report</h2>

      <button style={styles.backBtn} onClick={() => navigate(-1)}>
        ← Back
      </button>

      {error && <p style={{ color: "red" }}>{error}</p>}
      {success && <p style={{ color: "green" }}>{success}</p>}

      {donation && (
        <div style={styles.donationInfo}>
          <p>
            <b>Donation:</b> {donation.type === "money" ? `₹${donation.amount}` : donation.items}
          </p>
          <p>
            <b>Date:</b> {new Date(donation.created_at).toLocaleDateString()}
          </p>
        </div>
      )}

      <form onSubmit={handleSubmit} style={styles.form}>
        <input
          type="text"
          name="title"
          placeholder="Report Title"
          value={form.title}
          onChange={handleInputChange}
          required
          style={styles.input}
        />

        <textarea
          name="description"
          placeholder="How was the donation used? (required)"
          value={form.description}
          onChange={handleInputChange}
          required
          rows="5"
          style={styles.textarea}
        />

        <input
          type="number"
          step="0.01"
          name="amount_used"
          placeholder="Amount Used (if applicable)"
          value={form.amount_used}
          onChange={handleInputChange}
          style={styles.input}
        />

        <textarea
          name="items_used"
          placeholder="Items Used (if applicable)"
          value={form.items_used}
          onChange={handleInputChange}
          rows="3"
          style={styles.textarea}
        />

        <div style={styles.fileSection}>
          <label style={styles.label}>
            <b>Upload Proofs (images, bills, certificates):</b>
          </label>
          <input
            type="file"
            multiple
            onChange={handleFileChange}
            style={styles.fileInput}
          />
          {files.length > 0 && (
            <ul style={styles.fileList}>
              {files.map((f, i) => (
                <li key={i}>{f.name}</li>
              ))}
            </ul>
          )}
        </div>

        <button type="submit" disabled={loading} style={styles.submitBtn}>
          {loading ? "Uploading..." : "Submit Report"}
        </button>
      </form>
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
  backBtn: {
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
    marginBottom: "20px",
    fontFamily: "inherit",
  },
  donationInfo: { background: "#fff", padding: "12px", borderRadius: "8px", marginBottom: "18px", border: "1px solid #E6B6B6" },
  form: { background: "#fff", padding: "20px", borderRadius: "12px", maxWidth: "600px" },
  input: { width: "100%", padding: "10px", marginBottom: "12px", borderRadius: "6px", border: "1px solid #ddd", boxSizing: "border-box" },
  textarea: { width: "100%", padding: "10px", marginBottom: "12px", borderRadius: "6px", border: "1px solid #ddd", boxSizing: "border-box" },
  fileSection: { marginBottom: "16px" },
  label: { display: "block", marginBottom: "8px", color: "#333" },
  fileInput: { display: "block", marginBottom: "8px" },
  fileList: { fontSize: "13px", color: "#666", marginTop: "8px" },
  submitBtn: { width: "100%", padding: "12px", background: "#C97A7A", color: "#fff", border: "none", borderRadius: "6px", cursor: "pointer", fontWeight: "bold" },
};
