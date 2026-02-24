import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Login.css";

export default function Login() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [errorMsg, setErrorMsg] = useState("");

  // Forgot Password States
  const [showForgot, setShowForgot] = useState(false);
  const [resetStep, setResetStep] = useState(1); // 1: email, 2: otp, 3: password
  const [resetEmail, setResetEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [resetStatus, setResetStatus] = useState({ type: "", msg: "" });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");

    try {
      const res = await fetch("http://127.0.0.1:8000/api/login/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMsg(data.message || "Login failed");
        return;
      }

      // ✅ STORE TOKENS
      localStorage.setItem("access_token", data.access_token);
      localStorage.setItem("refresh_token", data.refresh_token);

      // ✅ STORE USER INFO
      localStorage.setItem("user_id", data.user_id);
      localStorage.setItem("username", data.username);
      localStorage.setItem("email", data.email);
      localStorage.setItem("role", data.role);

      // ✅ ROLE BASED REDIRECT
      if (data.role === "donor") navigate("/");
      else if (data.role === "ngo") navigate("/ngo-dashboard");
      else if (data.role === "admin") navigate("/admin-dashboard");
    } catch (err) {
      console.error(err);
      setErrorMsg("Server not reachable");
    }
  };

  const handleSendOTP = async (e) => {
    e.preventDefault();
    setResetStatus({ type: "", msg: "" });
    try {
      const res = await fetch("http://127.0.0.1:8000/api/password-reset/send-otp/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: resetEmail }),
      });
      const data = await res.json();
      if (res.ok) {
        setResetStep(2);
        setResetStatus({ type: "success", msg: "OTP sent to your email!" });
      } else {
        setResetStatus({ type: "error", msg: data.detail || "Error sending OTP" });
      }
    } catch (err) {
      setResetStatus({ type: "error", msg: "Server error" });
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setResetStatus({ type: "", msg: "" });
    try {
      const res = await fetch("http://127.0.0.1:8000/api/password-reset/verify-otp/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: resetEmail, otp: otp }),
      });
      const data = await res.json();
      if (res.ok) {
        setResetStep(3);
      } else {
        setResetStatus({ type: "error", msg: data.detail || "Invalid OTP" });
      }
    } catch (err) {
      setResetStatus({ type: "error", msg: "Server error" });
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setResetStatus({ type: "", msg: "" });
    try {
      const res = await fetch("http://127.0.0.1:8000/api/password-reset/reset/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: resetEmail, otp: otp, new_password: newPassword }),
      });
      const data = await res.json();
      if (res.ok) {
        setResetStatus({ type: "success", msg: "Password updated successfully!" });
        setTimeout(() => {
          setShowForgot(false);
          setResetStep(1);
          setResetEmail("");
          setOtp("");
          setNewPassword("");
        }, 2000);
      } else {
        setResetStatus({ type: "error", msg: data.detail || "Error resetting password" });
      }
    } catch (err) {
      setResetStatus({ type: "error", msg: "Server error" });
    }
  };

  return (
    <div className="login-page">
      <div className="login-background"></div>

      <div className="login-left-section">
        <div className="welcome-content">
          <h1 className="welcome-title">Welcome Back</h1>
          <p className="welcome-subtitle">Sign in to your account to continue making a difference</p>
          <div className="feature-list">
            <div className="feature-item">
              <span className="feature-icon">🎯</span>
              <p>Track your donations and impact</p>
            </div>
            <div className="feature-item">
              <span className="feature-icon">📊</span>
              <p>View utilization reports</p>
            </div>
            <div className="feature-item">
              <span className="feature-icon">🤝</span>
              <p>Connect with organizations</p>
            </div>
          </div>
        </div>
      </div>

      <div className="login-right-section">
        <div className="login-card">
          {/* Header */}
          <div className="login-header">
            <div className="logo-wrapper">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="login-logo"
                style={{ stroke: "white" }}
              >
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
            </div>
            <h2 className="login-title">{showForgot ? "Reset Password" : "Sign In"}</h2>
          </div>

          {!showForgot ? (
            <form onSubmit={handleSubmit} autoComplete="off" className="login-form">
              <div className="form-group">
                <label htmlFor="email" className="form-label">Email Address</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={handleChange}
                  className="form-input"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="password" className="form-label">Password</label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleChange}
                  className="form-input"
                  required
                />
              </div>

              <div className="forgot-password-link">
                <button
                  type="button"
                  className="link-button-small"
                  onClick={() => setShowForgot(true)}
                >
                  Forgot Password?
                </button>
              </div>

              {errorMsg && (
                <div className="error-message">
                  <span className="error-icon">⚠️</span>
                  {errorMsg}
                </div>
              )}

              <button type="submit" className="submit-button">
                Sign In
              </button>

              <p className="register-link">
                Don't have an account?
                <button
                  type="button"
                  className="link-button"
                  onClick={() => navigate("/register")}
                >
                  Create one
                </button>
              </p>
            </form>
          ) : (
            <div className="login-form">
              {resetStatus.msg && (
                <div className={`status-message ${resetStatus.type}`}>
                  {resetStatus.msg}
                </div>
              )}

              {resetStep === 1 && (
                <form onSubmit={handleSendOTP}>
                  <div className="form-group">
                    <label className="form-label">Email Address</label>
                    <input
                      type="email"
                      placeholder="Verified email address"
                      value={resetEmail}
                      onChange={(e) => setResetEmail(e.target.value)}
                      className="form-input"
                      required
                    />
                  </div>
                  <button type="submit" className="submit-button">Send OTP</button>
                </form>
              )}

              {resetStep === 2 && (
                <form onSubmit={handleVerifyOTP}>
                  <div className="form-group">
                    <label className="form-label">Enter 6-Digit OTP</label>
                    <input
                      type="text"
                      placeholder="XXXXXX"
                      maxLength="6"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      className="form-input"
                      required
                    />
                  </div>
                  <button type="submit" className="submit-button">Verify OTP</button>
                </form>
              )}

              {resetStep === 3 && (
                <form onSubmit={handleResetPassword}>
                  <div className="form-group">
                    <label className="form-label">New Password</label>
                    <input
                      type="password"
                      placeholder="Minimum 8 characters"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="form-input"
                      required
                    />
                  </div>
                  <button type="submit" className="submit-button">Reset Password</button>
                </form>
              )}

              <div className="back-to-login">
                <button
                  type="button"
                  className="link-button"
                  onClick={() => {
                    setShowForgot(false);
                    setResetStep(1);
                    setResetStatus({ type: "", msg: "" });
                  }}
                >
                  Back to Sign In
                </button>
              </div>
            </div>
          )}

          <div className="divider"></div>

          <div className="demo-section">
            <p className="demo-title">Demo Credentials</p>
            <div className="demo-item">
              <span className="demo-role">Donor:</span>
              <code>donor@test.com</code>
            </div>
            <div className="demo-item">
              <span className="demo-role">NGO:</span>
              <code>ngo@test.com</code>
            </div>
            <div className="demo-item">
              <span className="demo-role">Admin:</span>
              <code>admin@test.com</code>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
