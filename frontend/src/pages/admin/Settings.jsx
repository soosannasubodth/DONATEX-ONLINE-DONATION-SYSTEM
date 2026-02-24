import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaArrowLeft } from "react-icons/fa";

export default function Settings() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [form, setForm] = useState({
    site_title: "Donate Platform",
    default_currency: "INR",
    registration_open: true,
    require_ngo_approval: true,
  });

  useEffect(() => {
    const role = localStorage.getItem("role");
    if (role !== "admin") {
      navigate("/login");
      return;
    }

    const token = localStorage.getItem('access_token');
    fetch('http://127.0.0.1:8000/api/admin/settings/', { headers: { Authorization: `Bearer ${token}` } })
      .then(res => {
        if (!res.ok) throw new Error('Failed to load settings');
        return res.json();
      })
      .then(data => {
        setForm({
          site_title: data.site_title,
          default_currency: data.default_currency,
          registration_open: data.registration_open,
          require_ngo_approval: data.require_ngo_approval,
        });
        setLoading(false);
      })
      .catch(err => {
        setError(err.message || 'Unable to load settings');
        setLoading(false);
      });
  }, [navigate]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((s) => ({ ...s, [name]: type === "checkbox" ? checked : value }));
  };

  const handleSave = () => {
    setError("");
    setSuccess("");
    try {
      const token = localStorage.getItem('access_token');
      fetch('http://127.0.0.1:8000/api/admin/settings/', {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
        .then(res => {
          if (!res.ok) throw new Error('Failed to save settings');
          return res.json();
        })
        .then(data => {
          setForm({
            site_title: data.site_title,
            default_currency: data.default_currency,
            registration_open: data.registration_open,
            require_ngo_approval: data.require_ngo_approval,
          });
          setSuccess('Settings saved');
        })
        .catch(err => setError(err.message || 'Save failed'));
    } catch (e) {
      setError("Unable to save settings");
    }
  };

  const handleReset = () => {
    // reset on server
    const defaults = {
      site_title: "Donate Platform",
      default_currency: "INR",
      registration_open: true,
      require_ngo_approval: true,
    };
    const token = localStorage.getItem('access_token');
    fetch('http://127.0.0.1:8000/api/admin/settings/', {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(defaults),
    })
      .then(res => {
        if (!res.ok) throw new Error('Reset failed');
        return res.json();
      })
      .then(data => {
        setForm({
          site_title: data.site_title,
          default_currency: data.default_currency,
          registration_open: data.registration_open,
          require_ngo_approval: data.require_ngo_approval,
        });
        setSuccess('Settings reset to defaults');
      })
      .catch(err => setError(err.message || 'Reset failed'));
  };

  if (loading) return <div style={styles.container}><p>Loading settings...</p></div>;

  return (
    <div style={styles.container}>
      <div style={styles.backDashboardContainer}>
        <button onClick={() => navigate("/admin-dashboard")} style={styles.btnBackDashboard}>
          <FaArrowLeft /> Back to Dashboard
        </button>
      </div>

      <h2 style={styles.heading}>System Settings</h2>
      {error && <p style={{ color: "red" }}>{error}</p>}
      {success && <p style={{ color: "green" }}>{success}</p>}

      <div style={styles.box}>
        <label style={styles.label}>Site Title</label>
        <input name="site_title" value={form.site_title} onChange={handleChange} style={styles.input} />

        <label style={styles.label}>Default Currency</label>
        <input name="default_currency" value={form.default_currency} onChange={handleChange} style={styles.input} />

        <label style={styles.checkboxLabel}>
          <input type="checkbox" name="registration_open" checked={form.registration_open} onChange={handleChange} />
          <span style={{ marginLeft: 8 }}>Allow user registration</span>
        </label>

        <label style={styles.checkboxLabel}>
          <input type="checkbox" name="require_ngo_approval" checked={form.require_ngo_approval} onChange={handleChange} />
          <span style={{ marginLeft: 8 }}>Require admin approval for NGO profile</span>
        </label>

        <div style={{ display: "flex", gap: 10, marginTop: 12 }}>
          <button onClick={handleSave} style={styles.saveBtn}>Save Settings</button>
          <button onClick={handleReset} style={styles.cancelBtn}>Reset</button>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: { padding: 28, fontFamily: "Segoe UI, sans-serif", background: "#FDF6F6", minHeight: "100vh" },
  heading: { color: "#C97A7A", marginBottom: 20, fontWeight: "700" },
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
  box: { background: "#fff", padding: "24px", borderRadius: 12, maxWidth: 720, boxShadow: "0 4px 15px rgba(0,0,0,0.05)", border: "1px solid rgba(201, 122, 122, 0.1)" },
  label: { display: "block", marginTop: 12, marginBottom: 6, fontWeight: 600 },
  input: { width: "100%", padding: 8, borderRadius: 6, border: "1px solid #ddd" },
  checkboxLabel: { display: "flex", alignItems: "center", marginTop: 12 },
  saveBtn: { padding: "10px 14px", background: "#C97A7A", color: "#fff", border: "none", borderRadius: 6, cursor: "pointer" },
  cancelBtn: { padding: "10px 14px", background: "#eee", color: "#333", border: "none", borderRadius: 6, cursor: "pointer" },
};
