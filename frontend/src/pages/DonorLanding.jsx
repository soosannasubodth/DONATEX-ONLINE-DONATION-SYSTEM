import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaUserCircle, FaFacebookF, FaTwitter, FaInstagram, FaLinkedinIn, FaEnvelope, FaPhoneAlt, FaMapMarkerAlt, FaChevronLeft, FaChevronRight } from "react-icons/fa";
import donatexLogo from "../assets/donatexlogo.png";
import "./DonorLanding.css";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

export default function DonorLanding() {
  const navigate = useNavigate();

  const [username, setUsername] = useState(localStorage.getItem("username") || "");
  const [role, setRole] = useState(localStorage.getItem("role") || "");
  const [showSettings, setShowSettings] = useState(false);
  const [ngos, setNgos] = useState([]);
  const [currentSlide, setCurrentSlide] = useState(0);

  /* ================= DONATION STATES ================= */
  const [showDonateModal, setShowDonateModal] = useState(false);
  const [selectedNgo, setSelectedNgo] = useState(null);
  const [donationData, setDonationData] = useState({
    type: "money",
    amount: "",
    items: "",
  });

  const [showInfoModal, setShowInfoModal] = useState(false);
  const [infoNgo, setInfoNgo] = useState(null);

  /* ---------- NEWSLETTER STATE ---------- */
  const [email, setEmail] = useState("");
  const [msg, setMsg] = useState("");

  const handleSubscribe = async () => {
    if (!email) return;
    try {
      const res = await fetch(`${API_URL}/api/ensure-subscription/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email })
      });
      const data = await res.json();
      if (res.ok) {
        setMsg(data.message || "Success!");
        setEmail("");
      } else {
        setMsg(data.error || "Failed.");
      }
    } catch (err) {
      setMsg("Error connecting.");
    }
  };

  // Hero slides data
  const heroSlides = [
    {
      image: "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?q=80&w=2000&auto=format&fit=crop",
      title: "Change a Life Today",
      subtitle: "Your kindness provides food, education, and hope to those in need."
    },
    {
      image: "https://images.unsplash.com/photo-1542810634-71277d95dcbb?q=80&w=2000&auto=format&fit=crop",
      title: "Support Education",
      subtitle: "Empower the next generation with the tools they need to succeed."
    },
    {
      image: "https://images.unsplash.com/photo-1532629345422-7515f3d16bb6?q=80&w=2000&auto=format&fit=crop",
      title: "Pure Transparency",
      subtitle: "Track every rupee and see exactly how your contribution makes an impact."
    }
  ];

  /* ---------- AUTO SLIDE HERO ---------- */
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [heroSlides.length]);

  /* ---------- CLOSE PROFILE DROPDOWN ---------- */
  useEffect(() => {
    const closeDropdown = () => setShowSettings(false);
    window.addEventListener("click", closeDropdown);
    return () => window.removeEventListener("click", closeDropdown);
  }, []);

  /* ---------- FETCH NGOs (Now Public) ---------- */
  useEffect(() => {
    const fetchNgos = async () => {
      try {
        // We remove the token check here so public users can see NGOs
        const res = await fetch(`${API_URL}/api/ngos/`);
        if (!res.ok) return;
        const data = await res.json();
        const approvedNgos = data.filter((ngo) => ngo.status === "approved");
        setNgos(approvedNgos);
      } catch (err) {
        console.error("Error fetching NGOs:", err);
      }
    };
    fetchNgos();
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    setUsername("");
    setRole("");
    setShowSettings(false);
    window.location.reload(); // Refresh to update UI state
  };

  const goToDashboard = () => {
    if (role === "donor") navigate("/donor/dashboard");
    else if (role === "ngo") navigate("/ngo-dashboard");
    else if (role === "admin") navigate("/admin-dashboard");
    setShowSettings(false);
  };

  /* ---------- AUTH CHECK FOR DONATION ---------- */
  const handleDonateClick = (ngo) => {
    if (!username) {
      alert("Please register and log in to make a donation.");
      navigate("/login");
      return;
    }
    setSelectedNgo(ngo);
    setShowDonateModal(true);
  };

  const handleKnowMore = (ngo) => {
    (async () => {
      try {
        const res = await fetch(`${API_URL}/api/ngos/${ngo.id}/`);
        if (!res.ok) {
          setInfoNgo(ngo);
          setShowInfoModal(true);
          return;
        }
        const data = await res.json();
        setInfoNgo(data);
        setShowInfoModal(true);
      } catch (err) {
        console.error('Failed to load NGO details', err);
        setInfoNgo(ngo);
        setShowInfoModal(true);
      }
    })();
  };

  const submitDonation = async () => {
    try {
      const token = localStorage.getItem("access_token");
      const donorId = localStorage.getItem("user_id");

      if (!token || !donorId || !selectedNgo) {
        alert("Missing donor or NGO information");
        return;
      }

      if (donationData.type === "money") {
        if (!donationData.amount || donationData.amount <= 0) {
          alert("Please enter a valid amount");
          return;
        }

        // Step 1: Create order
        const orderResponse = await fetch(`${API_URL}/api/payments/create-order/`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            amount: parseFloat(donationData.amount),
            currency: "INR",
          }),
        });

        if (!orderResponse.ok) {
          alert("Failed to create payment order");
          return;
        }

        const orderData = await orderResponse.json();

        // Step 2: Open Razorpay modal
        const options = {
          key: orderData.key_id,
          amount: orderData.amount,
          currency: orderData.currency,
          name: "DonateX",
          description: `Donate to ${selectedNgo.name}`,
          order_id: orderData.order_id,
          handler: async function (response) {
            // Step 3: Verify payment
            try {
              const verifyResponse = await fetch(
                `${API_URL}/api/payments/verify/`,
                {
                  method: "POST",
                  headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                  },
                  body: JSON.stringify({
                    razorpay_order_id: response.razorpay_order_id,
                    razorpay_payment_id: response.razorpay_payment_id,
                    razorpay_signature: response.razorpay_signature,
                    donation_type: "direct",
                    ngo_id: selectedNgo.id,
                  }),
                }
              );

              if (!verifyResponse.ok) {
                alert("Payment verification failed");
                return;
              }

              alert("Donation submitted successfully ❤️");
              setShowDonateModal(false);
              setDonationData({ type: "money", amount: "", items: "" });
            } catch (err) {
              console.error(err);
              alert("Something went wrong");
            }
          },
          prefill: {
            name: username || "",
            email: localStorage.getItem("email") || "",
          },
          theme: {
            color: "#C97A7A",
          },
        };

        const razorpay = new window.Razorpay(options);
        razorpay.open();
      } else {
        // Item donation - use existing logic
        if (!donationData.items) {
          alert("Please enter items");
          return;
        }

        const payload = {
          ngo_id: Number(selectedNgo.id),
          type: donationData.type,
          amount: donationData.type === "money" ? parseFloat(donationData.amount) : null,
          items: donationData.type === "item" ? donationData.items : null,
        };

        const res = await fetch(`${API_URL}/api/donations/`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        });

        if (!res.ok) {
          const errorData = await res.json();
          alert(errorData.message || "Donation failed");
          return;
        }

        alert("Donation submitted successfully ❤️");
        setShowDonateModal(false);
        setDonationData({ type: "money", amount: "", items: "" });
      }
    } catch (err) {
      console.error(err);
      alert("Something went wrong");
    }
  };

  return (
    <div style={styles.container}>
      {/* ================= NAVBAR ================= */}
      <nav style={styles.navbar}>
        <div style={styles.logoContainer} onClick={() => navigate("/")}>
          <img src={donatexLogo} alt="DonateX" style={styles.logo} />
          <span style={styles.brand}>DonateX</span>
        </div>

        <ul style={styles.menu}>
          <li><span style={styles.navLink}>Home</span></li>
          <li><button onClick={() => navigate("/about")} style={{ ...styles.navLink, background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>About Us</button></li>
          <li><button onClick={() => navigate("/impact-map")} style={{ ...styles.navLink, background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>Impact Map</button></li>
          <li><a href="#gallery" style={styles.navLink}>Gallery</a></li>
          <li><a href="#contact" style={styles.navLink}>Contact Us</a></li>
        </ul>

        <div>
          {username ? (
            <div style={styles.profile}>
              <div
                onClick={(e) => { e.stopPropagation(); setShowSettings(!showSettings); }}
                style={styles.profileTrigger}
              >
                <FaUserCircle size={28} />
                <span style={styles.usernameText}>{username}</span>
              </div>

              {showSettings && (
                <div style={styles.dropdown} onClick={(e) => e.stopPropagation()}>
                  <button style={styles.dropBtn} onClick={goToDashboard}>Dashboard</button>
                  <button style={styles.logoutBtn} onClick={handleLogout}>Logout</button>
                </div>
              )}
            </div>
          ) : (
            <>
              <button onClick={() => navigate("/login")} style={styles.loginBtn}>Login</button>
              <button onClick={() => navigate("/register")} style={styles.registerBtn}>Register</button>
            </>
          )}
        </div>
      </nav>

      {/* ================= HERO SLIDER ================= */}
      <header className="hero-slider">
        <div className="slider-container">
          {heroSlides.map((slide, index) => (
            <div
              key={index}
              className={`slide ${index === currentSlide ? "active" : ""}`}
              style={{ backgroundImage: `url(${slide.image})` }}
            >
              <div className="slide-overlay"></div>
              <div className="slide-content">
                <h1 className="slide-title">
                  {slide.title.split("").map((char, i) => (
                    <span key={i} className="slide-char" style={{ animationDelay: `${i * 0.05}s` }}>{char}</span>
                  ))}
                </h1>
                <p className="slide-subtitle">{slide.subtitle}</p>
                <button className="slide-btn" onClick={() => window.scrollTo(0, 1200)}>
                  Donate Now →
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Slide Indicators */}
        <div className="slide-indicators">
          {heroSlides.map((_, index) => (
            <div
              key={index}
              className={`indicator ${index === currentSlide ? "active" : ""}`}
              onClick={() => setCurrentSlide(index)}
            ></div>
          ))}
        </div>
      </header>

      {/* ================= FEATURED NGOs ================= */}
      <section style={styles.section}>
        <h2 style={styles.sectionTitle}>Featured NGOs</h2>
        <div style={styles.cards}>
          {ngos.length > 0 ? ngos.map((ngo) => (
            <div key={ngo.id} style={styles.card} className="landing-card">
              {/* Logo Display */}
              {ngo.logo && (
                <img
                  src={
                    ngo.logo.startsWith("http")
                      ? ngo.logo
                      : `http://127.0.0.1:8000${ngo.logo}`
                  }
                  alt={ngo.name}
                  style={styles.cardLogo}
                  onError={(e) => (e.target.src = "https://via.placeholder.com/150?text=" + ngo.name)}
                />
              )}
              {/* Category Badge */}
              <div style={styles.categoryBadge}>{ngo.category}</div>
              <h3 style={{ color: '#C97A7A' }}>{ngo.name}</h3>
              <p style={{ fontSize: '14px', color: '#666' }}>{ngo.description}</p>
              {/* Action Buttons */}
              <div style={styles.cardBtnsContainer}>
                <button style={styles.cardBtn} onClick={() => handleDonateClick(ngo)}>❤️ Donate</button>
                <button style={styles.cardBtnSecondary} onClick={() => handleKnowMore(ngo)}>📖 Know More</button>
              </div>
            </div>
          )) : <p>Loading verified causes...</p>}

        </div>
      </section>

      {/* ================= IMPACT GALLERY ================= */}
      <section id="gallery" style={{ ...styles.section, background: '#fff' }}>
        <h2 style={styles.sectionTitle}>Our Impact Gallery</h2>
        <p style={{ marginBottom: '30px', color: '#555' }}>See the difference your donations are making around the world</p>
        <div style={styles.galleryGrid}>
          <img src="https://images.unsplash.com/photo-1488521787991-ed7bbaae773c" alt="Impact" style={styles.galleryImg} />
          <img src="https://images.unsplash.com/photo-1509099836639-18ba1795216d" alt="Impact" style={styles.galleryImg} />
          <img src="https://images.unsplash.com/photo-1532629345422-7515f3d16bb6" alt="Impact" style={styles.galleryImg} />
        </div>
      </section>

      {/* ================= CONTACT US ================= */}
      <section id="contact" style={styles.section}>
        <h2 style={styles.sectionTitle}>Contact Us</h2>
        <p style={{ marginBottom: '40px' }}>Have questions? We're here to help you make a difference</p>
        <div style={styles.contactGrid}>
          <div style={styles.contactCard}>
            <div style={{ ...styles.iconCircle, background: '#E3F2FD' }}><FaEnvelope color="#2196F3" /></div>
            <h4>Email</h4>
            <p>support@donatex.org<br />info@donatex.org</p>
          </div>
          <div style={styles.contactCard}>
            <div style={{ ...styles.iconCircle, background: '#E8F5E9' }}><FaPhoneAlt color="#4CAF50" /></div>
            <h4>Phone</h4>
            <p>+91 98765 43210<br />Mon-Fri, 9AM-6PM</p>
          </div>
          <div style={styles.contactCard}>
            <div style={{ ...styles.iconCircle, background: '#FCE4EC' }}><FaMapMarkerAlt color="#E91E63" /></div>
            <h4>Office</h4>
            <p>123 Charity Lane<br />Kerala, India 682001</p>
          </div>
        </div>
      </section>

      {/* ================= FOOTER (Multi-column) ================= */}
      <footer style={styles.footerContainer}>
        <div className="container" style={styles.footerGrid}>
          <div style={styles.footerCol}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '15px' }}>
              <FaUserCircle size={30} /> <span style={{ fontSize: '24px', fontWeight: 'bold' }}>DonateX</span>
            </div>
            <p style={{ lineHeight: '1.6', fontSize: '14px' }}>Making charitable giving simple, transparent, and impactful.</p>
            <div style={styles.socialIcons}>
              <a href="https://www.facebook.com" target="_blank" rel="noopener noreferrer" style={{ color: 'inherit' }}><FaFacebookF /></a>
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" style={{ color: 'inherit' }}><FaTwitter /></a>
              <a href="https://www.instagram.com/soosanna_subodh/" target="_blank" rel="noopener noreferrer" style={{ color: 'inherit' }}><FaInstagram /></a>
              <a href="https://www.linkedin.com/in/soosanna-subodh-ba305036b?utm_source=share_via&utm_content=profile&utm_medium=member_android" target="_blank" rel="noopener noreferrer" style={{ color: 'inherit' }}><FaLinkedinIn /></a>
            </div>
          </div>

          <div style={styles.footerCol}>
            <h4 style={styles.footerHead}>Quick Links</h4>
            <ul style={styles.footerLinks}>
              <li>Home</li>
              <li>About Us</li>
              <li>Causes</li>
              <li>Contact</li>
            </ul>
          </div>

          <div style={styles.footerCol}>
            <h4 style={styles.footerHead}>Support</h4>
            <ul style={styles.footerLinks}>
              <li>FAQ</li>
              <li>How to Donate</li>
              <li>Privacy Policy</li>
              <li>Terms of Service</li>
            </ul>
          </div>

          <div style={styles.footerCol}>
            <h4 style={styles.footerHead}>Newsletter</h4>
            <p style={{ fontSize: '14px', marginBottom: '15px' }}>Stay updated with our latest causes and impact stories.</p>
            <div style={{ display: 'flex', gap: '8px' }}>
              <input
                type="email"
                placeholder="Your email"
                style={styles.newsInput}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <button
                onClick={handleSubscribe}
                style={{
                  padding: '10px 15px',
                  background: '#C97A7A',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontWeight: '600'
                }}
              >
                Go
              </button>
            </div>
            {msg && <p style={{ marginTop: '10px', fontSize: '12px', color: msg.includes('Success') ? 'green' : 'red' }}>{msg}</p>}
          </div>
        </div>
        <div style={styles.footerBottom}>
          © 2026 DonateX. All rights reserved. Making the world a better place, one donation at a time.
        </div>
      </footer>

      {/* DONATION MODAL (No changes to logic) */}
      {showDonateModal && (
        <div style={modal.overlay}>
          <div style={modal.box}>
            <button
              onClick={() => setShowDonateModal(false)}
              style={{
                position: "absolute",
                top: "15px",
                right: "15px",
                background: "none",
                border: "none",
                fontSize: "24px",
                cursor: "pointer",
                color: "#999",
              }}
            >
              ✕
            </button>
            <h3 style={{ color: "#C97A7A", marginBottom: "20px" }}>Donate to {selectedNgo?.name}</h3>
            <select value={donationData.type} onChange={(e) => setDonationData({ ...donationData, type: e.target.value })} style={modal.input}>
              <option value="money">Money</option>
              <option value="item">Item</option>
            </select>
            {donationData.type === "money" && (
              <input type="number" placeholder="Amount (₹)" value={donationData.amount} onChange={(e) => setDonationData({ ...donationData, amount: e.target.value })} style={modal.input} />
            )}
            {donationData.type === "item" && (
              <textarea placeholder="Items" value={donationData.items} onChange={(e) => setDonationData({ ...donationData, items: e.target.value })} style={modal.input} />
            )}
            <select value={donationData.payment_method} onChange={(e) => setDonationData({ ...donationData, payment_method: e.target.value })} style={modal.input}>
              <option value="">Select Payment Method</option>
              <option value="PICKUP">PICKUP</option>
              <option value="UPI">UPI</option>
            </select>
            <div style={{ display: "flex", gap: "10px", marginTop: '10px' }}>
              <button onClick={submitDonation} style={{ ...styles.registerBtn, flex: 1 }}>Submit Donation</button>
              <button onClick={() => setShowDonateModal(false)} style={{ background: '#eee', border: 'none', padding: '10px 20px', borderRadius: '8px' }}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* INFO MODAL (KNOW MORE) */}
      {showInfoModal && infoNgo && (
        <div style={modal.overlay}>
          <div style={{ ...modal.box, maxHeight: '85vh', overflowY: 'auto' }}>
            <button
              onClick={() => setShowInfoModal(false)}
              style={{
                position: "absolute",
                top: "15px",
                right: "15px",
                background: "none",
                border: "none",
                fontSize: "24px",
                cursor: "pointer",
                color: "#999",
              }}
            >
              ✕
            </button>

            {/* NGO Header */}
            {infoNgo.logo && (
              <img
                src={
                  infoNgo.logo.startsWith("http")
                    ? infoNgo.logo
                    : `http://127.0.0.1:8000${infoNgo.logo}`
                }
                alt={infoNgo.name}
                style={{ width: "100%", height: "180px", objectFit: "contain", borderRadius: "8px", marginBottom: "20px", backgroundColor: "#f8f8f8" }}
              />
            )}

            <h2 style={{ color: "#C97A7A", marginBottom: "5px", fontSize: '28px' }}>{infoNgo.name}</h2>
            <p style={{ fontSize: "13px", color: "#C97A7A", marginBottom: "20px", fontWeight: '600' }}>🏢 {infoNgo.category}</p>

            {/* About Section - Main Explanation */}
            {infoNgo.about && (
              <section style={{ marginBottom: '24px', padding: '16px', background: '#f9f9f9', borderRadius: '8px', borderLeft: '4px solid #C97A7A' }}>
                <h3 style={{ color: '#C97A7A', marginBottom: '12px', fontSize: '18px' }}>📖 About Us</h3>
                <p style={{ fontSize: '15px', color: '#333', lineHeight: '1.8', margin: 0 }}>{infoNgo.about}</p>
              </section>
            )}

            {/* Mission / What Donors Support */}
            <section style={{ marginBottom: '24px', padding: '16px', background: '#f0f8f5', borderRadius: '8px' }}>
              <h3 style={{ color: '#2d7c6b', marginBottom: '12px', fontSize: '18px' }}>💚 What Your Donation Supports</h3>
              <p style={{ fontSize: '15px', color: '#333', lineHeight: '1.8', margin: 0 }}>
                {infoNgo.description || 'By donating to us, you directly help individuals and communities in need. Your contributions enable us to deliver essential services, education, healthcare, and support to those who need it most. Every donation, no matter the size, creates a meaningful impact and brings us closer to our mission of creating positive change.'}
              </p>
            </section>

            {/* Photos Gallery Section */}
            {infoNgo.photos && infoNgo.photos.length > 0 && (
              <section style={{ marginBottom: '20px' }}>
                <h3 style={{ color: '#C97A7A', marginBottom: '16px', fontSize: '18px' }}>📸 Our Work in Action</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
                  {infoNgo.photos.map((p) => (
                    <div key={p.id} style={{ position: 'relative' }}>
                      <img
                        src={p.image_url ? (p.image_url.startsWith('http') ? p.image_url : `http://127.0.0.1:8000${p.image_url}`) : (p.image ? `http://127.0.0.1:8000${p.image}` : 'https://via.placeholder.com/150')}
                        alt={p.caption || infoNgo.name}
                        style={{ width: '100%', height: '100px', objectFit: 'cover', borderRadius: '8px', cursor: 'pointer' }}
                        onError={(e) => (e.target.src = 'https://via.placeholder.com/150')}
                      />
                      {p.caption && (
                        <p style={{ fontSize: '12px', color: '#666', marginTop: '6px', textAlign: 'center' }}>{p.caption}</p>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            )}
            <button
              onClick={() => {
                setShowInfoModal(false);
                handleDonateClick(infoNgo);
              }}
              style={{ ...styles.registerBtn, width: "100%", marginTop: "20px" }}
            >
              ❤️ Donate Now
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ================= ENHANCED STYLES ================= */
const styles = {
  container: { fontFamily: "'Segoe UI', Roboto, sans-serif", color: '#333', scrollBehavior: 'smooth' },
  navbar: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 80px", background: "#fff", position: "sticky", top: 0, zIndex: 1000, boxShadow: "0 2px 10px rgba(0,0,0,0.05)" },
  logoContainer: { display: "flex", alignItems: "center", gap: "10px", cursor: 'pointer' },
  logo: { width: "40px" },
  brand: { fontSize: "24px", color: "#C97A7A", fontWeight: "bold" },
  menu: { display: "flex", gap: "30px", listStyle: "none", fontWeight: '500' },
  navLink: { textDecoration: 'none', color: '#555', fontFamily: "inherit", fontWeight: "inherit", fontSize: "inherit" },

  loginBtn: { marginRight: "15px", background: 'none', border: 'none', fontWeight: '600', cursor: 'pointer', color: '#C97A7A', fontFamily: 'inherit' },
  registerBtn: { background: "#C97A7A", color: "#fff", border: 'none', padding: '10px 25px', borderRadius: '25px', fontWeight: '600', cursor: 'pointer', fontFamily: 'inherit' },

  // Profile Section Styles (Matching Reference 2)
  profile: { position: "relative" },
  profileTrigger: { display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', color: '#C97A7A' },
  usernameText: { fontWeight: '600', fontSize: '18px' },
  dropdown: { position: "absolute", right: 0, top: "45px", background: "#fff", boxShadow: "0 10px 25px rgba(0,0,0,0.1)", padding: "15px", borderRadius: "12px", width: "180px", display: 'flex', flexDirection: 'column', gap: '10px' },
  dropBtn: { background: 'none', border: 'none', color: '#C97A7A', fontSize: '16px', fontWeight: '600', cursor: 'pointer', padding: '5px' },
  logoutBtn: { background: "#C97A7A", color: "#fff", border: 'none', padding: '8px', borderRadius: '8px', cursor: 'pointer' },

  hero: { height: "70vh", backgroundImage: "url('https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&q=80')", backgroundSize: "cover", backgroundPosition: 'center', position: "relative", display: 'flex', alignItems: 'center', justifyContent: 'center' },
  heroOverlay: { position: "absolute", inset: 0, background: "rgba(183,110,121,0.7)" },
  heroContent: { position: "relative", color: "#fff", textAlign: "center", maxWidth: '800px', padding: '0 20px' },
  heroTitle: { fontSize: "48px", marginBottom: "20px" },
  heroSub: { fontSize: "20px", marginBottom: "30px", opacity: 0.9 },
  heroBtn: { padding: "15px 40px", borderRadius: "30px", background: "#fff", color: "#C97A7A", border: "none", fontWeight: 'bold', fontSize: '16px', cursor: 'pointer' },

  section: { padding: "80px 10%", textAlign: "center", backgroundColor: '#fcfcfc' },
  sectionTitle: { fontSize: "32px", color: "#C97A7A", marginBottom: "10px" },
  cards: { display: "flex", gap: "25px", justifyContent: "center", flexWrap: 'wrap', marginTop: '40px' },
  card: { background: "#fff", padding: "20px", borderRadius: "15px", width: "280px", boxShadow: "0 10px 30px rgba(0,0,0,0.05)", textAlign: 'left', transition: 'transform 0.3s ease', overflow: 'hidden', position: 'relative' },
  cardLogo: { width: "100%", height: "140px", objectFit: "contain", borderRadius: "10px", marginBottom: "15px", backgroundColor: "#f8f8f8" },
  categoryBadge: { position: "absolute", top: "15px", right: "15px", background: "#C97A7A", color: "#fff", padding: "5px 12px", borderRadius: "20px", fontSize: "11px", fontWeight: "bold" },
  cardBtnsContainer: { display: "flex", gap: "10px", marginTop: "20px" },
  cardBtn: { flex: 1, padding: '10px', borderRadius: '8px', border: 'none', background: '#C97A7A', color: '#fff', fontWeight: '600', cursor: 'pointer', transition: 'background 0.2s' },
  cardBtnSecondary: { flex: 1, padding: '10px', borderRadius: '8px', border: '2px solid #C97A7A', color: '#C97A7A', background: 'none', fontWeight: '600', cursor: 'pointer', transition: 'background 0.2s' },

  galleryGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginTop: '20px' },
  galleryImg: { width: '100%', height: '200px', objectFit: 'cover', borderRadius: '15px' },

  contactGrid: { display: 'flex', justifyContent: 'center', gap: '30px', flexWrap: 'wrap' },
  contactCard: { background: '#fff', padding: '30px', borderRadius: '15px', width: '250px', boxShadow: '0 5px 20px rgba(0,0,0,0.05)' },
  iconCircle: { width: '50px', height: '50px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 15px auto', fontSize: '20px' },

  // Footer Styles (Matching Reference 1)
  footerContainer: { background: "#C97A7A", color: "#fff", padding: "60px 0 20px 0" },
  footerGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '40px', maxWidth: '1200px', margin: '0 auto', padding: '0 50px' },
  footerCol: { display: 'flex', flexDirection: 'column' },
  footerHead: { fontSize: '18px', marginBottom: '20px', fontWeight: 'bold' },
  footerLinks: { listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '14px', cursor: 'pointer' },
  socialIcons: { display: 'flex', gap: '15px', marginTop: '20px', cursor: 'pointer' },
  newsInput: { padding: '10px', borderRadius: '5px', border: 'none', marginTop: '10px', outline: 'none' },
  footerBottom: { textAlign: 'center', borderTop: '1px solid rgba(255,255,255,0.2)', marginTop: '40px', paddingTop: '20px', fontSize: '13px', opacity: 0.8 }
};

const modal = {
  overlay: { position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 3000 },
  box: { background: "#fff", padding: "30px", borderRadius: "16px", width: "450px", maxHeight: "90vh", overflowY: "auto", display: "flex", flexDirection: "column", gap: "15px", boxShadow: "0 20px 60px rgba(0,0,0,0.3)", position: "relative" },
  input: { padding: '10px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '16px' }
};