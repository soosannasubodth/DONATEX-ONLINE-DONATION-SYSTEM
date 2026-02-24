import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaArrowLeft } from "react-icons/fa";

export default function DonorProfile() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState({
    full_name: "",
    email: "",
    address: "",
    phone_number: "",
  });
  const [form, setForm] = useState({
    full_name: "",
    email: "",
    password: "",
    address: "",
    phone_number: "",
  });
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (!token) {
      navigate("/login");
      return;
    }

    fetch("http://127.0.0.1:8000/api/users/me/", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load profile");
        return res.json();
      })
      .then((data) => {
        setProfile(data);
        setForm({
          full_name: data.full_name,
          email: data.email,
          password: "",
          address: data.address || "",
          phone_number: data.phone_number || "",
        });
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message || "Unable to load profile");
        setLoading(false);
      });
  }, [navigate]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    const token = localStorage.getItem("access_token");
    const data = {};
    if (form.full_name !== profile.full_name) data.full_name = form.full_name;
    if (form.email !== profile.email) data.email = form.email;
    if (form.password) data.password = form.password;
    if (form.address !== profile.address) data.address = form.address;
    if (form.phone_number !== profile.phone_number) data.phone_number = form.phone_number;

    if (Object.keys(data).length === 0) {
      setError("No changes made");
      return;
    }

    try {
      const res = await fetch("http://127.0.0.1:8000/api/users/me/", {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.detail || "Failed to update profile");
      }

      const updated = await res.json();
      setProfile(updated);
      setForm({ ...form, password: "" });
      setSuccess("Profile updated successfully!");
      setEditing(false);
    } catch (err) {
      setError(err.message || "Update failed");
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.backDashboardContainer}>
        <button onClick={() => navigate("/donor/dashboard")} style={styles.btnBackDashboard}>
          <FaArrowLeft /> Back to Dashboard
        </button>
      </div>

      <h2 style={styles.heading}>My Profile</h2>

      {loading && <p>Loading...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}
      {success && <p style={{ color: "green" }}>{success}</p>}

      {!loading && (
        <div style={styles.profileBox}>
          {!editing ? (
            <div>
              <p><b>Name:</b> {profile.full_name}</p>
              <p><b>Email:</b> {profile.email}</p>
              <p><b>Address:</b> {profile.address || "-"}</p>
              <p><b>Phone:</b> {profile.phone_number || "-"}</p>
              <button onClick={() => setEditing(true)} style={styles.editBtn}>Edit Profile</button>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <input type="text" name="full_name" value={form.full_name} onChange={handleChange} style={styles.input} />
              <input type="email" name="email" value={form.email} onChange={handleChange} style={styles.input} />
              <input type="password" name="password" placeholder="New Password (optional)" value={form.password} onChange={handleChange} style={styles.input} />
              <input type="text" name="address" value={form.address} onChange={handleChange} placeholder="Address" style={styles.input} />
              <input type="text" name="phone_number" value={form.phone_number} onChange={handleChange} placeholder="Phone" style={styles.input} />
              <div style={styles.buttonGroup}>
                <button type="submit" style={styles.saveBtn}>Save</button>
                <button type="button" onClick={() => setEditing(false)} style={styles.cancelBtn}>Cancel</button>
              </div>
            </form>
          )}
        </div>
      )}
    </div>
  );
}

const styles = {
  container: { padding: "30px", background: "#FFF3F4", minHeight: "100vh", fontFamily: "Segoe UI, sans-serif" },
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
  profileBox: { background: "#fff", padding: "20px", borderRadius: "12px", maxWidth: "500px", boxShadow: "0 4px 15px rgba(0,0,0,0.05)" },
  input: { width: "100%", padding: "10px", marginBottom: "12px", borderRadius: "6px", border: "1px solid #ddd", boxSizing: "border-box" },
  editBtn: { padding: "10px 16px", background: "#C97A7A", color: "#fff", border: "none", borderRadius: "6px", cursor: "pointer" },
  buttonGroup: { display: "flex", gap: "8px" },
  saveBtn: { flex: 1, padding: "10px", background: "#4CAF50", color: "#fff", border: "none", borderRadius: "6px", cursor: "pointer" },
  cancelBtn: { flex: 1, padding: "10px", background: "#ccc", color: "#333", border: "none", borderRadius: "6px", cursor: "pointer" },
};
