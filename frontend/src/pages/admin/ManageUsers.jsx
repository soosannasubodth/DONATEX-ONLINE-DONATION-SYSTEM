import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaArrowLeft } from "react-icons/fa";

export default function ManageUsers() {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [error, setError] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({
    full_name: "",
    email: "",
    phone_number: "",
    address: "",
  });

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    const role = localStorage.getItem("role");
    if (!token || role !== "admin") {
      navigate("/admin-dashboard");
      return;
    }

    loadUsers();
  }, [navigate, filter]);

  const loadUsers = async () => {
    const token = localStorage.getItem("access_token");
    const url = filter === "all"
      ? "http://127.0.0.1:8000/api/users/"
      : `http://127.0.0.1:8000/api/users/?role=${filter}`;

    try {
      const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) throw new Error("Failed to load users");
      const data = await res.json();
      setUsers(data);
      setLoading(false);
    } catch (err) {
      setError(err.message || "Unable to load users");
      setLoading(false);
    }
  };

  const handleDelete = async (userId) => {
    if (!window.confirm("Delete this user?")) return;

    const token = localStorage.getItem("access_token");
    try {
      const res = await fetch(`http://127.0.0.1:8000/api/users/${userId}/`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to delete user");
      setUsers(users.filter((u) => u.id !== userId));
    } catch (err) {
      alert(err.message || "Delete failed");
    }
  };

  const handleEdit = (user) => {
    setEditingId(user.id);
    setEditForm({
      full_name: user.full_name,
      email: user.email,
      phone_number: user.phone_number || "",
      address: user.address || "",
    });
  };

  const handleSaveEdit = async (userId) => {
    const token = localStorage.getItem("access_token");
    try {
      const res = await fetch(`http://127.0.0.1:8000/api/users/${userId}/`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify(editForm),
      });
      if (!res.ok) throw new Error("Failed to update user");
      const updated = await res.json();
      setUsers(users.map((u) => (u.id === userId ? updated : u)));
      setEditingId(null);
    } catch (err) {
      alert(err.message || "Update failed");
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.backDashboardContainer}>
        <button onClick={() => navigate("/admin-dashboard")} style={styles.btnBackDashboard}>
          <FaArrowLeft /> Back to Dashboard
        </button>
      </div>

      <h2 style={styles.heading}>Manage Users</h2>

      <div style={styles.filters}>
        <label>Filter by Role: </label>
        <select value={filter} onChange={(e) => setFilter(e.target.value)} style={styles.select}>
          <option value="all">All Users</option>
          <option value="donor">Donors</option>
          <option value="ngo">NGOs</option>
          <option value="admin">Admins</option>
        </select>
      </div>

      {error && <p style={{ color: "red" }}>{error}</p>}
      {loading && <p>Loading...</p>}

      {!loading && users.length > 0 && (
        <table style={styles.table}>
          <thead>
            <tr style={styles.headerRow}>
              <th style={styles.th}>Name</th>
              <th style={styles.th}>Email</th>
              <th style={styles.th}>Phone</th>
              <th style={styles.th}>Address</th>
              <th style={styles.th}>Role</th>
              <th style={styles.th}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} style={styles.row}>
                <td style={styles.td}>
                  {editingId === user.id ? (
                    <input type="text" value={editForm.full_name} onChange={(e) => setEditForm({ ...editForm, full_name: e.target.value })} style={styles.input} />
                  ) : (
                    user.full_name
                  )}
                </td>
                <td style={styles.td}>
                  {editingId === user.id ? (
                    <input type="email" value={editForm.email} onChange={(e) => setEditForm({ ...editForm, email: e.target.value })} style={styles.input} />
                  ) : (
                    user.email
                  )}
                </td>
                <td style={styles.td}>
                  {editingId === user.id ? (
                    <input type="text" value={editForm.phone_number} onChange={(e) => setEditForm({ ...editForm, phone_number: e.target.value })} style={styles.input} />
                  ) : (
                    user.phone_number || "-"
                  )}
                </td>
                <td style={styles.td}>
                  {editingId === user.id ? (
                    <input type="text" value={editForm.address} onChange={(e) => setEditForm({ ...editForm, address: e.target.value })} style={styles.input} />
                  ) : (
                    user.address || "-"
                  )}
                </td>
                <td style={styles.td}>{user.role}</td>
                <td style={styles.td}>
                  {editingId === user.id ? (
                    <>
                      <button onClick={() => handleSaveEdit(user.id)} style={styles.saveBtn}>Save</button>
                      <button onClick={() => setEditingId(null)} style={styles.cancelBtn}>Cancel</button>
                    </>
                  ) : (
                    <>
                      <button onClick={() => handleEdit(user)} style={styles.editBtn}>Edit</button>
                      <button onClick={() => handleDelete(user.id)} style={styles.deleteBtn}>Delete</button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {!loading && users.length === 0 && <p>No users found.</p>}
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
  filters: { marginBottom: "20px" },
  select: { marginLeft: "10px", padding: "6px 10px", borderRadius: "4px", border: "1px solid #ddd" },
  table: { width: "100%", borderCollapse: "collapse", background: "#fff", borderRadius: "8px", overflow: "hidden", boxShadow: "0 2px 4px rgba(0,0,0,0.1)" },
  headerRow: { background: "#C97A7A", color: "#fff" },
  th: { padding: "12px", textAlign: "left", fontWeight: "bold" },
  row: { borderBottom: "1px solid #eee" },
  td: { padding: "12px" },
  input: { width: "100%", padding: "6px", borderRadius: "4px", border: "1px solid #ddd", boxSizing: "border-box" },
  editBtn: { padding: "6px 10px", background: "#C97A7A", color: "#fff", border: "none", borderRadius: "4px", cursor: "pointer", marginRight: "5px" },
  deleteBtn: { padding: "6px 10px", background: "#d32f2f", color: "#fff", border: "none", borderRadius: "4px", cursor: "pointer" },
  saveBtn: { padding: "6px 10px", background: "#4CAF50", color: "#fff", border: "none", borderRadius: "4px", cursor: "pointer", marginRight: "5px" },
  cancelBtn: { padding: "6px 10px", background: "#ccc", color: "#333", border: "none", borderRadius: "4px", cursor: "pointer" },
};
