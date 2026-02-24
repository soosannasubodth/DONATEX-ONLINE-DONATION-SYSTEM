import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaArrowLeft } from "react-icons/fa";

export default function CreateAnnouncement() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    ngo_id: "",
    title: "",
    description: "",
    image: null,
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleImageChange = (e) => {
    setFormData({ ...formData, image: e.target.files[0] });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem("access_token");
      const data = new FormData();

      if (formData.ngo_id) {
        data.append("ngo_id", formData.ngo_id);
      }
      data.append("title", formData.title);
      data.append("description", formData.description);
      if (formData.image) {
        data.append("image", formData.image);
      }

      const res = await fetch("http://127.0.0.1:8000/api/admin/announcements/", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: data,
      });

      if (res.ok) {
        alert("✅ Announcement created successfully!");
        setFormData({
          ngo_id: "",
          title: "",
          description: "",
          image: null,
        });
        navigate("/admin-dashboard");
      } else {
        const error = await res.json();
        alert(`❌ Failed to create announcement: ${error.detail || "Unknown error"}`);
      }
    } catch (err) {
      console.error(err);
      alert("Error creating announcement");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.backDashboardContainer}>
        <button onClick={() => navigate("/admin-dashboard")} style={styles.btnBackDashboard}>
          <FaArrowLeft /> Back to Dashboard
        </button>
      </div>

      <h2 style={styles.heading}>📢 Create Announcement</h2>

      <form onSubmit={handleSubmit} style={styles.form}>
        {/* NGO Selection (optional) */}
        <div style={styles.group}>
          <label style={styles.label}>For Specific NGO (Optional)</label>
          <input
            type="number"
            name="ngo_id"
            placeholder="Leave empty for all users, or enter NGO ID"
            value={formData.ngo_id}
            onChange={handleChange}
            style={styles.input}
          />
          <small style={{ color: '#999' }}>Leave empty to send to all donors/NGOs</small>
        </div>

        {/* Title */}
        <div style={styles.group}>
          <label style={styles.label}>Title</label>
          <input
            type="text"
            name="title"
            placeholder="Announcement title"
            value={formData.title}
            onChange={handleChange}
            style={styles.input}
            required
            maxLength={150}
          />
        </div>

        {/* Description */}
        <div style={styles.group}>
          <label style={styles.label}>Description</label>
          <textarea
            name="description"
            placeholder="Detailed announcement message"
            value={formData.description}
            onChange={handleChange}
            style={{ ...styles.input, minHeight: "120px", resize: "vertical" }}
            required
          />
        </div>

        {/* Image Upload */}
        <div style={styles.group}>
          <label style={styles.label}>Image (Optional)</label>
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            style={styles.fileInput}
          />
          {formData.image && (
            <p style={{ fontSize: "12px", color: "#666", marginTop: "5px" }}>
              ✓ {formData.image.name} selected
            </p>
          )}
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          style={{
            ...styles.submitBtn,
            opacity: loading ? 0.6 : 1,
          }}
        >
          {loading ? "Creating..." : "📤 Create Announcement"}
        </button>
      </form>
    </div>
  );
}

const styles = {
  container: {
    minHeight: "100vh",
    background: "#FDF6F6",
    padding: "40px",
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
  heading: {
    color: "#C97A7A",
    marginBottom: "30px",
    fontSize: "28px",
    fontWeight: "700",
  },
  form: {
    background: "#fff",
    padding: "30px",
    borderRadius: "12px",
    boxShadow: "0 4px 15px rgba(0,0,0,0.08)",
    maxWidth: "600px",
  },
  group: {
    marginBottom: "20px",
  },
  label: {
    display: "block",
    marginBottom: "8px",
    fontWeight: "600",
    color: "#C97A7A",
  },
  input: {
    width: "100%",
    padding: "12px",
    border: "1px solid #ddd",
    borderRadius: "8px",
    fontSize: "14px",
    fontFamily: "Segoe UI",
    boxSizing: "border-box",
  },
  fileInput: {
    width: "100%",
    padding: "8px",
    fontSize: "14px",
  },
  submitBtn: {
    width: "100%",
    padding: "12px",
    background: "#C97A7A",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    fontSize: "16px",
    fontWeight: "600",
    cursor: "pointer",
    marginTop: "20px",
  },
};
