import { useState } from "react";
import { useNavigate } from "react-router-dom";
import donatexLogo from "../assets/donatexlogo.png";
import "./Register.css";

function Register() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    role: "donor",
    organizationName: "",
    registrationNumber: "",
    address: "",
    phoneNumber: ""
  });

  const [emailStatus, setEmailStatus] = useState("");
  const [passwordMsg, setPasswordMsg] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });

    if (e.target.name === "password") {
      if (e.target.value.length < 6) {
        setPasswordMsg("Password must be at least 6 characters");
      } else {
        setPasswordMsg("Password strength looks good");
      }
    }
  };

  const checkEmail = async () => {
    if (!formData.email) return;

    try {
      const res = await fetch(
        `http://127.0.0.1:8000/check-email/?email=${formData.email}`
      );
      const data = await res.json();

      if (data.exists) {
        setEmailStatus("Email already registered");
      } else {
        setEmailStatus("Email available");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch("http://127.0.0.1:8000/register/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          full_name: formData.fullName,
          email: formData.email,
          password: formData.password,
          role: formData.role,
          organization_name: formData.organizationName,
          registration_number: formData.registrationNumber,
          address: formData.address,
          phone_number: formData.phoneNumber
        }),
      });

      const data = await response.json();

      if (response.ok) {
        alert(data.message);
        navigate("/login");
        setFormData({
          fullName: "",
          email: "",
          password: "",
          role: "donor",
          organizationName: "",
          registrationNumber: "",
          address: "",
          phoneNumber: ""
        });
        setEmailStatus("");
        setPasswordMsg("");
      } else {
        alert(data.message || JSON.stringify(data));
      }
    } catch (error) {
      console.error(error);
      alert("Something went wrong. Please try again.");
    }
  };

  return (
    <div className="register-page">
      <div className="register-background"></div>
      
      <div className="register-container">
        <div className="register-card">
          {/* Header Section */}
          <div className="register-header">
            <div className="logo-wrapper">
              <img
                src={donatexLogo}
                alt="DonateX Logo"
                className="register-logo"
              />
            </div>
            <h1 className="register-title">Create Account</h1>
            <p className="register-subtitle">Join us in making a difference</p>
          </div>

          <form onSubmit={handleSubmit} autoComplete="off" className="register-form">
            {/* Role Selection Tabs */}
            <div className="role-tabs">
              <button
                type="button"
                className={`role-tab ${formData.role === "donor" ? "active" : ""}`}
                onClick={() => setFormData({ ...formData, role: "donor" })}
              >
                💝 Donor
              </button>
              <button
                type="button"
                className={`role-tab ${formData.role === "ngo" ? "active" : ""}`}
                onClick={() => setFormData({ ...formData, role: "ngo" })}
              >
                🏢 NGO
              </button>
            </div>

            {/* Basic Info Section */}
            <div className="form-section">
              <h3 className="section-title">Basic Information</h3>
              
              <div className="form-group">
                <label htmlFor="fullName" className="form-label">Full Name</label>
                <input
                  type="text"
                  id="fullName"
                  name="fullName"
                  placeholder="Enter your full name"
                  value={formData.fullName}
                  onChange={handleChange}
                  className="form-input"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="email" className="form-label">Email Address</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={handleChange}
                  onBlur={checkEmail}
                  className="form-input"
                  required
                />
                {emailStatus && (
                  <small className={`form-hint ${emailStatus.includes("already") ? "error" : "success"}`}>
                    {emailStatus.includes("already") ? "❌" : "✓"} {emailStatus}
                  </small>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="password" className="form-label">Password</label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  placeholder="Create a strong password"
                  value={formData.password}
                  onChange={handleChange}
                  className="form-input"
                  required
                />
                {passwordMsg && (
                  <small className={`form-hint ${passwordMsg.includes("least") ? "error" : "success"}`}>
                    {passwordMsg.includes("least") ? "⚠️" : "✓"} {passwordMsg}
                  </small>
                )}
              </div>
            </div>

            {/* NGO Section */}
            {formData.role === "ngo" && (
              <div className="form-section ngo-section">
                <h3 className="section-title">Organization Details</h3>
                
                <div className="form-group">
                  <label htmlFor="organizationName" className="form-label">Organization Name</label>
                  <input
                    type="text"
                    id="organizationName"
                    name="organizationName"
                    placeholder="Name of your organization"
                    value={formData.organizationName}
                    onChange={handleChange}
                    className="form-input"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="registrationNumber" className="form-label">Registration Number</label>
                  <input
                    type="text"
                    id="registrationNumber"
                    name="registrationNumber"
                    placeholder="e.g., NGO/2023/12345"
                    value={formData.registrationNumber}
                    onChange={handleChange}
                    className="form-input"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="address" className="form-label">Address</label>
                  <input
                    type="text"
                    id="address"
                    name="address"
                    placeholder="Office address"
                    value={formData.address}
                    onChange={handleChange}
                    className="form-input"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="phoneNumber" className="form-label">Phone Number</label>
                  <input
                    type="text"
                    id="phoneNumber"
                    name="phoneNumber"
                    placeholder="+91 XXXXX XXXXX"
                    value={formData.phoneNumber}
                    onChange={handleChange}
                    className="form-input"
                    required
                  />
                </div>
              </div>
            )}

            {/* Submit Button */}
            <button type="submit" className="submit-button">
              Create Account
            </button>

            {/* Login Link */}
            <p className="login-link">
              Already have an account? 
              <button
                type="button"
                className="link-button"
                onClick={() => navigate("/login")}
              >
                Sign In
              </button>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Register;
