import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaThLarge,
  FaHandHoldingHeart,
  FaBullseye,
  FaHistory,
  FaTicketAlt,
  FaUser,
  FaSearch,
  FaCog,
  FaArrowRight,
  FaSignOutAlt,
  FaExternalLinkAlt
} from "react-icons/fa";
import AnnouncementNotifications from "../../components/AnnouncementNotifications";
import "./DonorDashboard.css";

export default function DonorDashboard() {
  const navigate = useNavigate();
  const username = localStorage.getItem("username") || "Donor";
  const userInitials = username.substring(0, 2).toUpperCase();

  const handleLogout = () => {
    localStorage.clear(); // Clear all user data
    navigate("/login"); // Redirect to login
  };

  const [stats, setStats] = useState({
    total_donated: 0,
    active_campaigns: 0,
    impact_reports: 0,
    participations: 0
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem("access_token");
        const res = await fetch("http://127.0.0.1:8000/api/donor/stats/", {
          headers: { "Authorization": `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setStats(data);
        }
      } catch (err) {
        console.error("Error fetching donor stats:", err);
      }
    };
    fetchStats();
  }, []);

  // Core features for the main navigation
  const navItems = [
    { name: "Dashboard", icon: <FaThLarge />, path: "/donor-dashboard", active: true },
    { name: "My Donations", icon: <FaHandHoldingHeart />, path: "/donor/my-donations" },
    { name: "Active Campaigns", icon: <FaBullseye />, path: "/donor/campaigns" },
    { name: "My Participations", icon: <FaHistory />, path: "/donor/participations" },
    { name: "Support Tickets", icon: <FaTicketAlt />, path: "/donor/support" },
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
            <button className="nav-item" onClick={() => navigate("/donor/profile")}>
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
            <h1>Dashboard</h1>
          </div>

          <div className="topbar-right">
            <AnnouncementNotifications userRole="donor" />

            <div className="user-profile" onClick={() => navigate("/donor/profile")} style={{ cursor: 'pointer' }}>
              <div className="user-info">
                <span className="user-name">{username}</span>
                <span className="user-role">Premium Donor</span>
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
            <p>Your contributions have impacted 1,240 lives this month.</p>
          </div>

          {/* STATS GRID - GIVING PORTFOLIO */}
          <div className="stats-grid">
            <div className="stat-card card-blue" onClick={() => navigate("/donor/my-donations")}>
              <div className="stat-header">
                <div className="stat-icon"><FaHandHoldingHeart /></div>
                <FaArrowRight color="#2196F3" />
              </div>
              <div className="stat-label">Total Donated</div>
              <div className="stat-value">
                ₹{Number(stats.total_donated).toLocaleString('en-IN')}
                {stats.total_items > 0 && (
                  <span style={{ fontSize: '14px', color: '#999', display: 'block', fontWeight: '400' }}>
                    + {stats.total_items} Items
                  </span>
                )}
              </div>
            </div>

            <div className="stat-card card-green" onClick={() => navigate("/donor/campaigns")}>
              <div className="stat-header">
                <div className="stat-icon"><FaBullseye /></div>
                <FaArrowRight color="#4CAF50" />
              </div>
              <div className="stat-label">Active Campaigns</div>
              <div className="stat-value">{stats.active_campaigns}</div>
            </div>

            <div className="stat-card card-purple" onClick={() => navigate("/donor/donation-usage")}>
              <div className="stat-header">
                <div className="stat-icon"><FaHistory /></div>
                <FaArrowRight color="#9C27B0" />
              </div>
              <div className="stat-label">Impact Reports</div>
              <div className="stat-value">{stats.impact_reports} Verified</div>
            </div>

            <div className="stat-card card-rose" onClick={() => navigate("/donor/participations")}>
              <div className="stat-header">
                <div className="stat-icon"><FaUser /></div>
                <FaArrowRight color="rgb(201, 122, 122)" />
              </div>
              <div className="stat-label">Participations</div>
              <div className="stat-value">{stats.participations} Events</div>
            </div>
          </div>

          {/* DASHBOARD SECTIONS */}
          <div className="dashboard-sections">
            <div className="dashboard-card">
              <div className="card-title">
                Your Impact Growth
                <span style={{ fontSize: '12px', color: '#4CAF50' }}>+12.5% vs last month</span>
              </div>
              <div className="chart-container">
                {/* Illustrative Bar Chart Mock */}
                <div style={{ display: 'flex', alignItems: 'flex-end', gap: '15px', height: '150px' }}>
                  {[40, 70, 45, 90, 65, 80].map((h, i) => (
                    <div key={i} style={{
                      width: '30px',
                      height: `${h}%`,
                      background: i === 3 ? 'var(--primary)' : 'var(--primary-light)',
                      borderRadius: '8px 8px 0 0',
                      transition: 'height 1s ease'
                    }}></div>
                  ))}
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '15px', color: '#999', fontSize: '12px' }}>
                <span>Jan</span><span>Feb</span><span>Mar</span><span>Apr</span><span>May</span><span>Jun</span>
              </div>
            </div>

            <div className="dashboard-card">
              <div className="card-title">Cause Distribution</div>
              <div className="chart-container">
                <div className="doughnut-mock">
                  <span className="chart-center-val">₹230</span>
                  <span className="chart-center-label">This Week</span>
                </div>
              </div>
              <div style={{ marginTop: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ width: '10px', height: '100%', borderLeft: '4px solid var(--primary)' }}></div>
                    Education
                  </div>
                  <strong>60%</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ width: '10px', height: '100%', borderLeft: '4px solid #4CAF50' }}></div>
                    Healthcare
                  </div>
                  <strong>40%</strong>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
