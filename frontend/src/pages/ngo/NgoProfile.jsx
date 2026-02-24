import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaArrowLeft } from "react-icons/fa";

function NgoProfile() {
  const navigate = useNavigate();
  const [ngo, setNgo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [logo, setLogo] = useState(null);

  const token = localStorage.getItem("access_token");

  const primaryColor = "rgb(201, 122, 122)";
  const white = "#ffffff";

  useEffect(() => {
    fetchNgoProfile();
  }, []);

  // ---------------- GET NGO PROFILE ----------------
  const fetchNgoProfile = async () => {
    try {
      const res = await fetch("http://127.0.0.1:8000/api/ngo/profile/", {
        headers: {
          Authorization: "Bearer " + token,
        },
      });

      const data = await res.json();

      if (res.status === 404) {
        // No profile yet -> Allow user to create one
        setNgo(null);
        setLoading(false);
        return;
      }

      if (!res.ok) {
        setError(data.message || data.detail || "Failed to load profile");
        return;
      }

      setNgo(data);
      setName(data.name || "");
      setCategory(data.category || "");
      setDescription(data.description || "");
      setError("");
      setLoading(false);
    } catch (err) {
      console.error(err);
      setError("Server not reachable");
      setLoading(false);
    }
  };

  // ---------------- POST UPDATE PROFILE ----------------
  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("name", name);
    formData.append("category", category);
    formData.append("description", description);
    if (logo) formData.append("logo", logo);

    try {
      const res = await fetch("http://127.0.0.1:8000/api/ngo/profile/", {
        method: "POST",
        headers: {
          Authorization: "Bearer " + token,
        },
        body: formData,
      });

      const data = await res.json();
      alert(data.message || "Profile updated");
      fetchNgoProfile();
    } catch (err) {
      console.error(err);
      alert("Update failed");
    }
  };

  // ---------------- UI STATES ----------------
  if (loading) return <p>Loading NGO Profile...</p>;

  if (error)
    return (
      <p style={{ color: "red", textAlign: "center" }}>
        {error}
      </p>
    );



  return (
    <div
      style={{
        backgroundColor: white,
        padding: "40px",
        maxWidth: "900px",
        margin: "40px auto",
        borderRadius: "12px",
        boxShadow: "0 6px 16px rgba(0,0,0,0.08)",
        lineHeight: "1.6",
        fontFamily: "Segoe UI, sans-serif",
      }}
    >
      <div style={{ marginBottom: "20px" }}>
        <button
          onClick={() => navigate("/ngo-dashboard")}
          style={{
            background: "none",
            border: `1px solid ${primaryColor}`,
            color: primaryColor,
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
          }}
        >
          <FaArrowLeft /> Back to Dashboard
        </button>
      </div>

      <h2 style={{ color: primaryColor, marginBottom: "25px", fontWeight: "700" }}>NGO Profile</h2>

      {/* -------- Profile View -------- */}
      {ngo && (
        <div style={{ marginBottom: "30px" }}>
          <p style={{ marginBottom: "12px" }}><strong>Name:</strong> {ngo.name}</p>
          <p style={{ marginBottom: "12px" }}><strong>Category:</strong> {ngo.category}</p>
          <p style={{ marginBottom: "18px" }}><strong>Description:</strong><br />{ngo.description}</p>

          {ngo.status && (
            <p style={{ marginBottom: "20px", marginTop: "20px" }}>
              <strong>Status:</strong>{" "}
              <span
                style={{
                  marginLeft: "10px",
                  padding: "8px 16px",
                  borderRadius: "30px",
                  color: white,
                  backgroundColor:
                    ngo.status === "approved"
                      ? "green"
                      : ngo.status === "pending"
                        ? primaryColor
                        : "red",
                  fontWeight: "bold",
                  fontSize: "0.95em",
                }}
              >
                {ngo.status.toUpperCase()}
              </span>
            </p>
          )}

          {ngo.logo && (
            <div style={{ marginTop: "25px" }}>
              <img
                src={
                  ngo.logo.startsWith("http")
                    ? ngo.logo
                    : `http://127.0.0.1:8000${ngo.logo}`
                }
                alt="NGO Logo"
                width="140"
                style={{
                  borderRadius: "10px",
                  border: `3px solid ${primaryColor}`,
                  padding: "4px",
                }}
              />
            </div>
          )}
        </div>
      )}

      {ngo && <hr style={{ borderColor: primaryColor, opacity: 0.3, margin: "30px 0" }} />}

      {/* -------- Edit Form -------- */}
      <h3 style={{ color: primaryColor, marginBottom: "20px" }}>{ngo ? "Edit / Update Profile" : "Create NGO Profile"}</h3>

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: "24px" }}>
          <label style={{ display: "block", marginBottom: "8px", fontWeight: "600" }}>NGO Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            style={{
              width: "100%",
              padding: "12px",
              borderRadius: "8px",
              border: `1px solid ${primaryColor}`,
              fontSize: "1rem",
            }}
          />
        </div>

        <div style={{ marginBottom: "24px" }}>
          <label style={{ display: "block", marginBottom: "8px", fontWeight: "600" }}>Category</label>
          <input
            type="text"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            required
            style={{
              width: "100%",
              padding: "12px",
              borderRadius: "8px",
              border: `1px solid ${primaryColor}`,
              fontSize: "1rem",
            }}
          />
        </div>

        <div style={{ marginBottom: "24px" }}>
          <label style={{ display: "block", marginBottom: "8px", fontWeight: "600" }}>Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
            rows="6"
            style={{
              width: "100%",
              padding: "12px",
              borderRadius: "8px",
              border: `1px solid ${primaryColor}`,
              fontSize: "1rem",
              lineHeight: "1.5",
              resize: "vertical",
            }}
          />
        </div>

        <div style={{ marginBottom: "30px" }}>
          <label style={{ display: "block", marginBottom: "8px", fontWeight: "600" }}>Logo</label>
          <input
            type="file"
            onChange={(e) => setLogo(e.target.files[0])}
            style={{ padding: "5px" }}
          />
        </div>

        <button
          type="submit"
          style={{
            backgroundColor: primaryColor,
            color: white,
            padding: "12px 30px",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
            fontWeight: "bold",
            fontSize: "1rem",
            transition: "opacity 0.2s",
          }}
        >
          Save Profile
        </button>
      </form>
    </div>
  );
}

export default NgoProfile;
