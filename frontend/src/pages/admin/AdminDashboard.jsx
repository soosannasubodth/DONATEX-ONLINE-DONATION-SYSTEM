import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaThLarge,
  FaBuilding,
  FaBullseye,
  FaCheckCircle,
  FaUsers,
  FaTicketAlt,
  FaBullhorn,
  FaCog,
  FaSignOutAlt,
  FaExternalLinkAlt,
  FaArrowRight,
  FaHandHoldingHeart,
  FaUserShield,
  FaClock
} from "react-icons/fa";
import AnnouncementNotifications from "../../components/AnnouncementNotifications";
import "./AdminDashboard.css";

export default function AdminDashboard() {
  const navigate = useNavigate();
  const username = localStorage.getItem("username") || "Admin";
  const userInitials = username.substring(0, 2).toUpperCase();

  const [stats, setStats] = useState({
    total_donors: 0,
    total_ngos: 0,
    total_money: 0,
    total_items: 0,
    pending_ngo_profiles: 0,
    pending_campaigns: 0,
    open_tickets: 0
  });
  const [subscribers, setSubscribers] = useState([]);

  useEffect(() => {
    const role = localStorage.getItem("role");
    if (role !== "admin") {
      navigate("/login");
      return;
    }

    const fetchStats = async () => {
      try {
        const token = localStorage.getItem("access_token");

        // Fetch Stats
        const res = await fetch("http://127.0.0.1:8000/api/admin/stats/", {
          headers: { "Authorization": `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setStats(data);
        }

        // Fetch Subscribers
        const subRes = await fetch("http://127.0.0.1:8000/api/admin/subscribers/", {
          headers: { "Authorization": `Bearer ${token}` }
        });
        if (subRes.ok) {
          const subData = await subRes.json();
          setSubscribers(subData);
        }
      } catch (err) {
        console.error("Error fetching admin data:", err);
      }
    };
    fetchStats();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  const navItems = [
    { name: "Dashboard", icon: <FaThLarge />, path: "/admin-dashboard", active: true },
    { name: "NGO Approvals", icon: <FaBuilding />, path: "/admin/approve-profiles", badge: stats.pending_ngo_profiles },
    { name: "Campaigns", icon: <FaBullseye />, path: "/admin/campaigns/approval", badge: stats.pending_campaigns },
    { name: "Verify Reports", icon: <FaCheckCircle />, path: "/admin/verify-reports" },
    { name: "Manage Users", icon: <FaUsers />, path: "/admin/manage-users" },
    { name: "Support Tickets", icon: <FaTicketAlt />, path: "/admin/support", badge: stats.open_tickets },
  ];

  return (
    <div className="dashboard-wrapper">
      {/* SIDEBAR */}
      <aside className="sidebar">
        <div className="sidebar-logo">
          <FaUserShield />
          <span>AdminPanel</span>
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
              {item.badge > 0 && <span className="nav-badge" style={{ marginLeft: 'auto', background: 'var(--primary)', color: '#fff', fontSize: '10px', padding: '2px 6px', borderRadius: '10px' }}>{item.badge}</span>}
            </button>
          ))}


        </nav>
      </aside>

      {/* MAIN CONTENT */}
      <main className="main-content">
        {/* TOPBAR */}
        <header className="topbar">
          <div className="topbar-left">
            <h1>System Overview</h1>
          </div>

          <div className="topbar-right">
            <AnnouncementNotifications userRole="admin" />

            <div className="user-profile">
              <div className="user-info">
                <span className="user-name">{username}</span>
                <span className="user-role">Super Administrator</span>
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
            <h2>System Health: Excellent ✨</h2>
            <p>You have {stats.pending_ngo_profiles + stats.pending_campaigns} items awaiting your approval.</p>
          </div>

          {/* STATS GRID */}
          <div className="stats-grid">
            <div className="stat-card card-blue" onClick={() => navigate("/admin/manage-users")}>
              <div className="stat-header">
                <div className="stat-icon"><FaUsers /></div>
                <FaArrowRight color="#2196F3" />
              </div>
              <div className="stat-label">Total platform Users</div>
              <div className="stat-value">{stats.total_donors + stats.total_ngos}</div>
              <div style={{ fontSize: '12px', color: '#666', marginTop: '5px' }}>{stats.total_ngos} Registered NGOs</div>
            </div>

            <div className="stat-card card-green" onClick={() => navigate("/admin/statistics")}>
              <div className="stat-header">
                <div className="stat-icon"><FaHandHoldingHeart /></div>
                <FaArrowRight color="#4CAF50" />
              </div>
              <div className="stat-label">System Donations</div>
              <div className="stat-value">₹{Number(stats.total_money).toLocaleString('en-IN')}</div>
              <div style={{ fontSize: '12px', color: '#666', marginTop: '5px' }}>+ {stats.total_items} Item Donations</div>
            </div>

            <div className="stat-card card-rose" onClick={() => navigate("/admin/approve-profiles")}>
              <div className="stat-header">
                <div className="stat-icon"><FaClock /></div>
                <FaArrowRight color="rgb(201, 122, 122)" />
              </div>
              <div className="stat-label">Pending NGO Profiles</div>
              <div className="stat-value">{stats.pending_ngo_profiles}</div>
              <div style={{ fontSize: '12px', color: '#666', marginTop: '5px' }}>Awaiting verification</div>
            </div>

            <div className="stat-card card-orange" onClick={() => navigate("/admin/support")}>
              <div className="stat-header">
                <div className="stat-icon"><FaTicketAlt /></div>
                <FaArrowRight color="#FF9800" />
              </div>
              <div className="stat-label">Open Support Tickets</div>
              <div className="stat-value">{stats.open_tickets}</div>
              <div style={{ fontSize: '12px', color: '#666', marginTop: '5px' }}>Requires response</div>
            </div>
          </div>

          {/* DASHBOARD SECTIONS */}
          <div className="dashboard-sections">
            <div className="dashboard-card">
              <div className="card-title">
                Platform Activity (Last 6 Months)
                <span style={{ fontSize: '12px', color: '#4CAF50' }}>Growth: +18%</span>
              </div>
              <div className="chart-container" style={{ height: '200px', padding: '10px 0' }}>
                <svg width="100%" height="100%" viewBox="0 0 600 200" preserveAspectRatio="none">
                  <defs>
                    <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.3" />
                      <stop offset="100%" stopColor="var(--primary)" stopOpacity="0" />
                    </linearGradient>
                  </defs>

                  {/* Grid Lines */}
                  {[0, 50, 100, 150, 200].map(val => (
                    <line key={val} x1="0" y1={val} x2="600" y2={val} stroke="#f0f0f0" strokeWidth="1" />
                  ))}

                  {/* Area Fill */}
                  <path
                    d="M0 200 L0 150 C100 130, 100 140, 200 120 C300 100, 300 110, 400 60 C500 50, 500 40, 600 20 L600 200 Z"
                    fill="url(#chartGradient)"
                  />

                  {/* The Line */}
                  <path
                    d="M0 150 C100 130, 100 140, 200 120 C300 100, 300 110, 400 60 C500 50, 500 40, 600 20"
                    fill="none"
                    stroke="var(--primary)"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />

                  {/* Data Points */}
                  {[
                    { x: 0, y: 150 }, { x: 200, y: 120 }, { x: 400, y: 60 }, { x: 600, y: 20 }
                  ].map((p, i) => (
                    <circle key={i} cx={p.x} cy={p.y} r="5" fill="#fff" stroke="var(--primary)" strokeWidth="2" />
                  ))}
                </svg>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '10px', color: '#999', fontSize: '11px', fontWeight: '500' }}>
                <span>Aug</span><span>Sep</span><span>Oct</span><span>Nov</span><span>Dec</span><span>Jan</span>
              </div>
            </div>

            <div className="dashboard-card">
              <div className="card-title">Quick Actions</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <button
                  onClick={() => navigate("/admin/create-announcement")}
                  style={{ padding: '12px', borderRadius: '12px', background: 'var(--primary-light)', color: 'var(--primary)', border: 'none', fontWeight: '600', cursor: 'pointer', textAlign: 'left', display: 'flex', alignItems: 'center', gap: '10px' }}
                >
                  <FaBullhorn /> Broadcast Announcement
                </button>
                <button
                  onClick={() => navigate("/admin/campaigns/approval")}
                  style={{ padding: '12px', borderRadius: '12px', background: '#E8F5E9', color: '#4CAF50', border: 'none', fontWeight: '600', cursor: 'pointer', textAlign: 'left', display: 'flex', alignItems: 'center', gap: '10px' }}
                >
                  <FaBullseye /> Review {stats.pending_campaigns} Campaigns
                </button>
                <button
                  onClick={() => navigate("/admin/settings")}
                  style={{ padding: '12px', borderRadius: '12px', background: '#F3E5F5', color: '#9C27B0', border: 'none', fontWeight: '600', cursor: 'pointer', textAlign: 'left', display: 'flex', alignItems: 'center', gap: '10px' }}
                >
                  <FaCog /> Global System Settings
                </button>
              </div>
            </div>

            {/* NEWSLETTER SUBSCRIBERS SECTION */}
            <div className="dashboard-card" style={{ gridColumn: '1 / -1' }}>
              <div className="card-title">
                Newsletter Subscribers
                <span style={{ fontSize: '12px', color: '#666', fontWeight: 'normal' }}> ({subscribers.length} total)</span>
              </div>
              <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
                {subscribers.length === 0 ? (
                  <p style={{ color: '#999', fontStyle: 'italic' }}>No subscribers yet.</p>
                ) : (
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ textAlign: 'left', borderBottom: '1px solid #eee' }}>
                        <th style={{ padding: '8px', fontSize: '13px', color: '#555' }}>Email</th>
                        <th style={{ padding: '8px', fontSize: '13px', color: '#555' }}>Date Subscribed</th>
                      </tr>
                    </thead>
                    <tbody>
                      {subscribers.map((sub) => (
                        <tr key={sub.id} style={{ borderBottom: '1px solid #f9f9f9' }}>
                          <td style={{ padding: '8px', fontSize: '13px' }}>{sub.email}</td>
                          <td style={{ padding: '8px', fontSize: '13px', color: '#777' }}>
                            {new Date(sub.subscribed_at).toLocaleDateString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
