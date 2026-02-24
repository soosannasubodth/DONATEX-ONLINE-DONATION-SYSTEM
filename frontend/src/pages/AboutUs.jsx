import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaUserCircle, FaLinkedinIn, FaTwitter, FaInstagram, FaHeart, FaUsers, FaTrophy, FaAward } from "react-icons/fa";
import donatexLogo from "../assets/donatexlogo.png";
import founderSoosanna from "../assets/founder_soosanna.jpg";
import "./AboutUs.css";

export default function AboutUs() {
  const navigate = useNavigate();
  const [username] = useState(localStorage.getItem("username") || "");
  const [showSettings, setShowSettings] = useState(false);

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  const goToDashboard = () => {
    const role = localStorage.getItem("role");
    navigate(role === "donor" ? "/" : `/${role}-dashboard`);
  };

  const stats = [
    { icon: "❤️", number: 500000, label: "Donations Made", suffix: "+" },
    { icon: "🏢", number: 150, label: "NGOs Supported", suffix: "+" },
    { icon: "👥", number: 50000, label: "Active Donors", suffix: "+" },
    { icon: "🌍", number: 25, label: "States Covered", suffix: "+" }
  ];

  const values = [
    { icon: <FaHeart />, title: "Transparency", description: "100% clarity on how donations are utilized." },
    { icon: <FaUsers />, title: "Community", description: "Empowering donors and NGOs to work together." },
    { icon: <FaTrophy />, title: "Impact", description: "Measuring the real difference made in lives." },
    { icon: <FaAward />, title: "Trust", description: "Rigorous verification of all partner organizations." }
  ];

  /* ANIMATED NUMBER COMPONENT */
  const AnimatedNumber = ({ target, duration }) => {
    const [count, setCount] = useState(0);
    useEffect(() => {
      let start = 0;
      const end = parseInt(target, 10);
      const timer = setInterval(() => {
        start += Math.ceil(end / (duration / 20));
        if (start > end) { start = end; clearInterval(timer); }
        setCount(start);
      }, 20);
      return () => clearInterval(timer);
    }, [target, duration]);
    return <span>{count.toLocaleString()}</span>;
  };

  return (
    <div className="about-container">
      {/* NAVBAR */}
      <nav className="about-navbar">
        <div className="navbar-logo" onClick={() => navigate("/")}>
          <img src={donatexLogo} alt="DonateX" />
          <span>DonateX</span>
        </div>
        <ul className="navbar-menu">
          <li><button onClick={() => navigate("/")} className="nav-btn">Home</button></li>
          <li><button onClick={() => navigate("/impact-map")} className="nav-btn">Impact Map</button></li>
          <li><a href="#mission" className="nav-link">Our Mission</a></li>
          <li><a href="#founders" className="nav-link">Founders</a></li>
          <li><a href="#impact" className="nav-link">Impact</a></li>
        </ul>
        <div className="navbar-auth">
          {username ? (
            <div className="profile-menu">
              <button className="profile-trigger" onClick={(e) => { e.stopPropagation(); setShowSettings(!showSettings); }}>
                <FaUserCircle size={28} />
                <span>{username}</span>
              </button>
              {showSettings && (
                <div className="dropdown-menu">
                  <button onClick={goToDashboard} className="dropdown-btn">Dashboard</button>
                  <button onClick={handleLogout} className="dropdown-logout">Logout</button>
                </div>
              )}
            </div>
          ) : (
            <>
              <button onClick={() => navigate("/login")} className="nav-login">Login</button>
              <button onClick={() => navigate("/register")} className="nav-register">Register</button>
            </>
          )}
        </div>
      </nav>

      {/* HERO SECTION - GRADIENT BACKGROUND */}
      <section className="about-hero-minimal">
        <div className="hero-text-wrapper">
          <h1 className="hero-title">About DonateX</h1>
          <p className="hero-subtitle">Building a transparent and impactful platform for charitable giving</p>
        </div>
      </section>

      {/* MISSION SECTION */}
      <section id="mission" className="mission-section">
        <div className="section-container">
          <h2>Our Mission</h2>
          <p className="mission-statement">
            We bridge the gap between compassionate donors and verified social causes using technology to ensure every penny counts towards real change.
          </p>
          <div className="mission-goals">
            <div className="goal-card"><span>🎯</span><h3>Transparency</h3><p>Every donation is tracked and impact is shared clearly with donors.</p></div>
            <div className="goal-card"><span>🤝</span><h3>Trust</h3><p>Rigorous monitoring and verification of every NGO on our platform.</p></div>
            <div className="goal-card"><span>💡</span><h3>Innovation</h3><p>Simplified, powerful tools designed for seamless charitable giving.</p></div>
          </div>
        </div>
      </section>

      {/* VALUES SECTION - ALIGNED IN ONE ROW */}
      <section id="values" className="values-section">
        <div className="section-container">
          <h2>Our Core Values</h2>
          <div className="values-row">
            {values.map((v, i) => (
              <div key={i} className="value-item">
                <div className="v-icon">{v.icon}</div>
                <h3>{v.title}</h3>
                <p>{v.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* STATS SECTION */}
      <section className="stats-section">
        <div className="section-container">
          <div className="stats-grid">
            {stats.map((s, i) => (
              <div key={i} className="stat-card">
                <div className="stat-icon">{s.icon}</div>
                <div className="stat-number"><AnimatedNumber target={s.number} duration={2000} />{s.suffix}</div>
                <div className="stat-label">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FOUNDER SECTION */}
      <section id="founders" className="founders-section">
        <div className="section-container">
          <div className="single-founder-flex">
            <div className="founder-img-box">
              <div className="founder-card-inner">
                <div className="founder-card-front">
                  <img src={founderSoosanna} alt="Soosanna Subodh" />
                </div>
                <div className="founder-card-back">
                  <h3>Soosanna Subodh</h3>
                  <span className="role-tag-back">Founder & CEO</span>
                  <p className="back-quote">"Transparency is the key to trust."</p>
                  <div className="founder-links-back">
                    <a href="https://www.linkedin.com/in/soosanna-subodh-ba305036b?utm_source=share_via&utm_content=profile&utm_medium=member_android" target="_blank" rel="noopener noreferrer" style={{ color: 'inherit' }}>
                      <FaLinkedinIn />
                    </a>
                    <FaTwitter />
                    <a href="https://www.instagram.com/soosanna_subodh/" target="_blank" rel="noopener noreferrer" style={{ color: 'inherit' }}>
                      <FaInstagram />
                    </a>
                  </div>
                </div>
              </div>
            </div>
            <div className="founder-info">
              <h2>Meet Our Founder</h2>
              <span className="role-tag">Founder & CEO</span>
              <h3>Soosanna Subodh</h3>
              <p>Soosanna envisioned DonateX to create a transparent, technology-driven ecosystem where every contribution creates a measurable impact and empowers communities.</p>
              <p className="quote">"Kindness combined with transparency can change the world. Our mission is to make giving simple and meaningful."</p>

              <div className="storyline-link-container">
                <button onClick={() => navigate("/our-story")} className="view-storyline-btn">
                  View Our Storyline →
                </button>
              </div>

              <div className="founder-links">
                <div><FaLinkedinIn /></div>
                <div><FaTwitter /></div>
                <div><FaInstagram /></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* IMPACT STORIES - IMPROVED ALIGNMENT */}
      <section id="impact" className="impact-section">
        <div className="section-container">
          <h2>Our Impact Stories</h2>
          <div className="impact-grid-aligned">
            {[
              { img: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&q=80", title: "Education", metric: "5k+ Students" },
              { img: "https://plus.unsplash.com/premium_photo-1673953509975-576678fa6710?auto=format&fit=crop&q=80", title: "Healthcare", metric: "10k+ Lives" },
              { img: "https://images.unsplash.com/photo-1531206715517-5c0ba140b2b8?auto=format&fit=crop&q=80", title: "Community", metric: "50+ Villages" },
              { img: "https://images.unsplash.com/photo-1544027993-37dbfe43562a?auto=format&fit=crop&q=80", title: "Skill Dev", metric: "2k+ Youth" }
            ].map((item, i) => (
              <div key={i} className="impact-story-card">
                <div className="story-img-container">
                  <img src={item.img} alt={item.title} />
                  <div className="story-badge">{item.metric}</div>
                </div>
                <div className="story-body"><h3>{item.title}</h3></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA SECTION - MATCHING MOCK */}
      <section className="cta-modern">
        <div className="section-container">
          <h2>Be Part of the Change</h2>
          <p>Your contribution can transform lives and build stronger communities</p>
          <button className="cta-btn-main" onClick={() => navigate("/")}>Start Donating Today</button>
        </div>
      </section>

      <footer className="simple-footer">
        <p>&copy; 2026 DonateX. Making the world a better place, one donation at a time.</p>
      </footer>
    </div>
  );
}