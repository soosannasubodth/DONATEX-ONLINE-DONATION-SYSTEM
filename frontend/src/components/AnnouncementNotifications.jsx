import { useState, useEffect } from "react";
import { FaBell, FaTimes } from "react-icons/fa";

export default function AnnouncementNotifications({ userRole }) {
  const [announcements, setAnnouncements] = useState([]);
  const [showPanel, setShowPanel] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const fetchAnnouncements = async () => {
      try {
        const token = localStorage.getItem("access_token");
        if (!token) return;

        const endpoint = userRole === "donor" 
          ? "http://127.0.0.1:8000/api/announcements/donor/"
          : "http://127.0.0.1:8000/api/announcements/ngo/";

        const res = await fetch(endpoint, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res.ok) {
          const data = await res.json();
          setAnnouncements(data);
          setUnreadCount(data.length);
        }
      } catch (err) {
        console.error("Error fetching announcements:", err);
      }
    };

    fetchAnnouncements();
  }, [userRole]);

  const handleClose = (id) => {
    setAnnouncements(announcements.filter((a) => a.id !== id));
    setUnreadCount(Math.max(0, unreadCount - 1));
  };

  return (
    <div style={styles.container}>
      {/* Bell Icon with Badge */}
      <div
        style={styles.bellIcon}
        onClick={() => setShowPanel(!showPanel)}
      >
        <FaBell size={24} color="#C97A7A" />
        {unreadCount > 0 && (
          <div style={styles.badge}>{unreadCount}</div>
        )}
      </div>

      {/* Notifications Panel */}
      {showPanel && (
        <div style={styles.panel}>
          <div style={styles.panelHeader}>
            <h3 style={{margin: 0}}>📢 Announcements</h3>
            <button
              onClick={() => setShowPanel(false)}
              style={styles.closeBtn}
            >
              <FaTimes />
            </button>
          </div>

          {announcements.length === 0 ? (
            <p style={styles.emptyMsg}>No announcements at this time</p>
          ) : (
            <div style={styles.announceList}>
              {announcements.map((ann) => (
                <div key={ann.id} style={styles.announcementItem}>
                  {ann.image_url && (
                    <img
                      src={ann.image_url}
                      alt={ann.title}
                      style={styles.thumbnail}
                      onError={(e) =>
                        (e.target.style.display = "none")
                      }
                    />
                  )}
                  <div style={styles.content}>
                    <h4 style={styles.title}>{ann.title}</h4>
                    <p style={styles.desc}>{ann.description.substring(0, 100)}...</p>
                    <p style={styles.date}>
                      {new Date(ann.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <button
                    onClick={() => handleClose(ann.id)}
                    style={styles.removeBtn}
                  >
                    <FaTimes size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

const styles = {
  container: {
    position: "relative",
  },
  bellIcon: {
    position: "relative",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  badge: {
    position: "absolute",
    top: "-8px",
    right: "-8px",
    background: "#ff4444",
    color: "#fff",
    borderRadius: "50%",
    width: "24px",
    height: "24px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "12px",
    fontWeight: "bold",
  },
  panel: {
    position: "absolute",
    right: 0,
    top: "40px",
    width: "350px",
    maxHeight: "500px",
    overflowY: "auto",
    background: "#fff",
    boxShadow: "0 8px 25px rgba(0,0,0,0.15)",
    borderRadius: "8px",
    zIndex: 1000,
  },
  panelHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "15px",
    borderBottom: "1px solid #eee",
    background: "#f9f9f9",
  },
  closeBtn: {
    background: "none",
    border: "none",
    fontSize: "18px",
    cursor: "pointer",
    color: "#999",
  },
  announceList: {
    padding: "10px",
  },
  announcementItem: {
    padding: "12px",
    borderBottom: "1px solid #f0f0f0",
    display: "flex",
    gap: "10px",
    position: "relative",
  },
  thumbnail: {
    width: "60px",
    height: "60px",
    borderRadius: "6px",
    objectFit: "cover",
    flexShrink: 0,
  },
  content: {
    flex: 1,
  },
  title: {
    margin: "0 0 5px 0",
    fontSize: "14px",
    fontWeight: "600",
    color: "#C97A7A",
  },
  desc: {
    margin: "0 0 5px 0",
    fontSize: "12px",
    color: "#666",
    lineHeight: "1.4",
  },
  date: {
    margin: 0,
    fontSize: "11px",
    color: "#999",
  },
  removeBtn: {
    position: "absolute",
    top: "10px",
    right: "10px",
    background: "none",
    border: "none",
    color: "#ccc",
    cursor: "pointer",
    fontSize: "12px",
  },
  emptyMsg: {
    padding: "30px",
    textAlign: "center",
    color: "#999",
    fontSize: "14px",
  },
};
