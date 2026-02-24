import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaThLarge,
  FaHandHoldingHeart,
  FaBullseye,
  FaFileAlt,
  FaTicketAlt,
  FaUser,
  FaCog,
  FaArrowRight,
  FaSignOutAlt,
  FaExternalLinkAlt,
  FaCheckCircle,
  FaClock
} from "react-icons/fa";
import AnnouncementNotifications from "../../components/AnnouncementNotifications";
import "./NgoDashboard.css";

export default function NgoDashboard() {
  const navigate = useNavigate();
  const username = localStorage.getItem("username") || "NGO";
  const userInitials = username.substring(0, 2).toUpperCase();

  const [stats, setStats] = useState({
    total_money: 0,
    total_items: 0,
    active_campaigns: 0,
    pending_reports: 0,
    verified_reports: 0
  });

  useEffect(() => {
    const role = localStorage.getItem("role");
    if (role !== "ngo") {
      navigate("/login");
      return;
    }

    const fetchStats = async () => {
      try {
        const token = localStorage.getItem("access_token");
        const res = await fetch("http://127.0.0.1:8000/api/ngo/stats/", {
          headers: { "Authorization": `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setStats(data);
        }
      } catch (err) {
        console.error("Error fetching NGO stats:", err);
      }
    };
    fetchStats();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  const navItems = [
    { name: "Dashboard", icon: <FaThLarge />, path: "/ngo-dashboard", active: true },
    { name: "Donations", icon: <FaHandHoldingHeart />, path: "/ngo-dashboard/donations" },
    { name: "Campaigns", icon: <FaBullseye />, path: "/ngo/campaigns" },
    { name: "Upload Reports", icon: <FaFileAlt />, path: "/ngo/select-donation-report" },
    { name: "Support Tickets", icon: <FaTicketAlt />, path: "/ngo/support" },
  ];

  return (
    <div className="dashboard-wrapper">
      {/* SIDEBAR */}
      <aside className="sidebar">
        <div className="sidebar-logo">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M12 21a9 9 0 100-18 9 9 0 000 18z" />
            <path d="M12 7l-2 5h4l-2 5" fill="currentColor" />
          </svg>
          <span>DonateX</span>
        </div>

        <nav className="sidebar-nav">
          <button className="nav-item" onClick={() => navigate("/")} style={{ marginBottom: '10px', borderBottom: '1px solid #eee', borderRadius: '0', paddingBottom: '15px' }}>
            <span className="nav-icon"><FaExternalLinkAlt /></span>
            <span>Back to Website</span>
          </button>

          {navItems.map((item, i) => (
            <button
              key={i}
              className={`nav-item ${item.active ? "active" : ""}`}
              onClick={() => navigate(item.path)}
            >
              <span className="nav-icon">{item.icon}</span>
              <span>{item.name}</span>
            </button>
          ))}

          <div style={{ marginTop: "auto", display: 'flex', flexDirection: 'column', gap: '5px' }}>
            <button className="nav-item" onClick={() => navigate("/ngo/account")}>
              <span className="nav-icon"><FaCog /></span>
              <span>Account Settings</span>
            </button>
          </div>
        </nav>
      </aside>

      {/* MAIN CONTENT */}
      <main className="main-content">
        {/* TOPBAR */}
        <header className="topbar">
          <div className="topbar-left">
            <h1>NGO Portal</h1>
          </div>

          <div className="topbar-right">
            <AnnouncementNotifications userRole="ngo" />

            <div className="user-profile" onClick={() => navigate("/ngo/profile")} style={{ cursor: 'pointer' }}>
              <div className="user-info">
                <span className="user-name">{username}</span>
                <span className="user-role">Verified Organization</span>
              </div>
              <div className="user-avatar">{userInitials}</div>
            </div>

            <button className="topbar-logout" onClick={handleLogout} title="Logout">
              <FaSignOutAlt />
            </button>
          </div>
        </header>

        {/* CONTENT AREA */}
        <div className="content-area">
          <div className="welcome-msg">
            <h2>Welcome Back, {username}! ✨</h2>
            <p>You have {stats.pending_reports} pending utilization reports to submit.</p>
          </div>

          {/* STATS GRID - MANAGEMENT PORTFOLIO */}
          <div className="stats-grid">
            <div className="stat-card card-blue" onClick={() => navigate("/ngo-dashboard/donations")}>
              <div className="stat-header">
                <div className="stat-icon"><FaHandHoldingHeart /></div>
                <FaArrowRight color="#2196F3" />
              </div>
              <div className="stat-label">Donations Received</div>
              <div className="stat-value">
                ₹{Number(stats.total_money).toLocaleString('en-IN')}
                {stats.total_items > 0 && (
                  <span style={{ fontSize: '14px', color: '#999', display: 'block', fontWeight: '400' }}>
                    + {stats.total_items} Items
                  </span>
                )}
              </div>
            </div>

            <div className="stat-card card-green" onClick={() => navigate("/ngo/campaigns")}>
              <div className="stat-header">
                <div className="stat-icon"><FaBullseye /></div>
                <FaArrowRight color="#4CAF50" />
              </div>
              <div className="stat-label">Active Campaigns</div>
              <div className="stat-value">{stats.active_campaigns}</div>
            </div>

            <div className="stat-card card-rose" onClick={() => navigate("/ngo/select-donation-report")}>
              <div className="stat-header">
                <div className="stat-icon"><FaClock /></div>
                <FaArrowRight color="rgb(201, 122, 122)" />
              </div>
              <div className="stat-label">Pending Reports</div>
              <div className="stat-value">{stats.pending_reports} Needs Action</div>
            </div>

            <div className="stat-card card-purple" onClick={() => navigate("/ngo/verified-reports")}>
              <div className="stat-header">
                <div className="stat-icon"><FaCheckCircle /></div>
                <FaArrowRight color="#9C27B0" />
              </div>
              <div className="stat-label">Verified Impact</div>
              <div className="stat-value">{stats.verified_reports} Reports</div>
            </div>
          </div>

          {/* DASHBOARD SECTIONS */}
          <div className="dashboard-sections">
            <div className="dashboard-card">
              <div className="card-title">
                Resources Management
                <span style={{ fontSize: '12px', color: '#4CAF50' }}>Efficiently tracked</span>
              </div>
              <div className="chart-container">
                <div style={{ display: 'flex', alignItems: 'flex-end', gap: '15px', height: '150px' }}>
                  {[60, 40, 85, 55, 75, 95].map((h, i) => (
                    <div key={i} style={{
                      width: '30px',
                      height: `${h}%`,
                      background: i === 5 ? 'var(--primary)' : 'var(--primary-light)',
                      borderRadius: '8px 8px 0 0',
                      transition: 'height 1s ease'
                    }}></div>
                  ))}
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '15px', color: '#999', fontSize: '12px' }}>
                <span>Health</span><span>Food</span><span>Edu</span><span>Relief</span><span>Shelter</span><span>Water</span>
              </div>
            </div>

            <div className="dashboard-card">
              <div className="card-title">Verification Status</div>
              <div className="chart-container" style={{ flexDirection: 'column', gap: '20px' }}>
                <div style={{ width: '100%', height: '10px', background: '#eee', borderRadius: '5px', overflow: 'hidden' }}>
                  <div style={{ width: `${(stats.verified_reports / (stats.verified_reports + stats.pending_reports || 1)) * 100}%`, height: '100%', background: '#4CAF50' }}></div>
                </div>
                <div style={{ fontSize: '14px', textAlign: 'center' }}>
                  <strong>{Math.round((stats.verified_reports / (stats.verified_reports + stats.pending_reports || 1)) * 100)}%</strong> Reports Verified
                </div>
                <p style={{ fontSize: '12px', color: '#666', textAlign: 'center' }}>Keep uploading reports to maintain a high verification rate.</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
