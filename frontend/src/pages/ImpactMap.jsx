import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaUserCircle, FaMapMarkerAlt, FaGlobe, FaChevronRight } from "react-icons/fa";
import donatexLogo from "../assets/donatexlogo.png";
import "./ImpactMap.css";

export default function ImpactMap() {
    const navigate = useNavigate();
    const username = localStorage.getItem("username") || "";
    const [showSettings, setShowSettings] = useState(false);

    const impactZones = [
        { name: "Sub-Saharan Africa", need: "High", priority: "Food & Water", donors: 1200 },
        { name: "South Asia", need: "Critical", priority: "Education & Health", donors: 850 },
        { name: "Southeast Asia", need: "Moderate", priority: "Disaster Relief", donors: 420 },
        { name: "Central America", need: "High", priority: "Child Welfare", donors: 310 },
    ];

    return (
        <div className="impact-container">
            {/* NAVBAR */}
            <nav className="impact-navbar">
                <div className="logo-section" onClick={() => navigate("/")}>
                    <img src={donatexLogo} alt="DonateX" />
                    <span>DonateX</span>
                </div>
                <ul className="nav-menu">
                    <li onClick={() => navigate("/")}>Home</li>
                    <li onClick={() => navigate("/about")}>About Us</li>
                    <li className="active">Impact Map</li>
                    <li>Gallery</li>
                </ul>
                <div className="auth-section">
                    {username ? (
                        <div className="user-pill" onClick={() => setShowSettings(!showSettings)}>
                            <FaUserCircle />
                            <span>{username}</span>
                            {showSettings && (
                                <div className="nav-dropdown">
                                    <button onClick={() => navigate("/donor/dashboard")}>Dashboard</button>
                                    <button onClick={() => { localStorage.clear(); navigate("/"); window.location.reload(); }}>Logout</button>
                                </div>
                            )}
                        </div>
                    ) : (
                        <button className="login-pill" onClick={() => navigate("/login")}>Login</button>
                    )}
                </div>
            </nav>

            {/* HERO SECTION */}
            <div className="impact-hero">
                <div className="hero-text">
                    <h1>Global Impact <span>Visualization</span></h1>
                    <p>Real-time data visualization of areas requiring urgent humanitarian assistance and our ongoing support missions.</p>
                </div>
            </div>

            {/* MAP SECTION */}
            <div className="map-section">
                <div className="map-card">
                    <div className="map-header">
                        <FaGlobe className="globe-icon" />
                        <div>
                            <h3>Interactive World Relief Map</h3>
                            <p>Regions highlighted in <span>Dusky Rose</span> represent active priority zones.</p>
                        </div>
                    </div>

                    <div className="svg-wrapper">
                        {/* Realistic SVG world map with highlighted zones */}
                        <svg viewBox="0 0 1000 500" className="world-svg">
                            <path
                                className="land-mass"
                                d="M174.4,142.1c0.1-0.2,0.2-0.5,0.4-0.7c1.7-2.6,4-3.5,6.9-2.2c1.7,0.7,3.1,1.9,4.4,3.2c1.4,1.4,1.3,2.6-0.3,3.9c-1.3,1.1-2.9,1.9-4.5,2.6c-2.4,1-4.7,1.1-6.7-0.7c-0.8-0.7-1.3-1.6-1.5-2.6C173,144.5,173.3,143.2,174.4,142.1z M837.7,219.7c0.2-2,0.7-3.8,1.9-5.4c1.2-1.6,3-2.3,4.9-1.3c2.2,1.2,1.9,3.7,1.3,5.6c-0.6,1.8-2.6,2.9-4.2,3.3C840,222.3,838.3,221.4,837.7,219.7z M367.1,180.1c-1-0.7-2-1.5-2.8-2.5c-1.7-1.9-1.2-4.1,0.9-5c3.2-1.4,6.4-0.5,9,1.6c2.5,2.1,1.8,4.7-1,6.5c-1.6,1-3.6,1.2-5.4,0.3C367.6,180.7,367.3,180.5,367.1,180.1z M409.2,25.6c0.5-0.1,1-0.2,1.5-0.2c2.1-0.2,3.9,0.7,4.8,2.7c0.8,1.8,0.3,4-1.2,5.2c-1.6,1.3-3.9,0.9-5.2-1C407.7,30.3,407.9,27.5,409.2,25.6z M161,162.7c-0.2-0.5-0.4-1.1-0.5-1.6c-0.6-2.5-0.1-4.6,2.2-5.9c2-1.2,4.2-1.5,6.4-1.1c2,0.4,3.7,1.8,4,3.8c0.4,2.5-0.6,4.6-2.6,5.9c-2,1.3-4.3,1.6-6.6,1.1C162.7,164.5,161.7,163.7,161,162.7z M145.4,129.5c-0.3-1-0.4-2.1-0.3-3.2c0.3-2.6,2.2-4.1,4.8-3.8c2.8,0.3,4.6,2.5,4.3,5.1c-0.4,2.6-2.6,4.5-5.3,4.2C146.9,131.6,145.7,130.8,145.4,129.5z M43.9,141.5c1.4-1.7,3.1-2.9,5.2-3.3c3.1-0.5,5.6,0.6,7,3.3c1.3,2.5,0.3,5.7-2.3,6.8c-2.4,1-5,0.4-7-1.4C44.9,145.3,44,143.6,43.9,141.5z M100.8,103.1c-1.5-1.5-1.5-3.3-0.2-5c2.4-3,2.4-3.1,5.2-0.4c4,3.8,4.1,3.8,0.4,7.8c-0.8,0.9-3.2,0.9-4,0C101.6,104.9,101.2,104.1,100.8,103.1z M60.1,65.8c-0.1,2,0,4.1-0.8,6c-1.8,3.9-3.7,4-6.8,1.3c-2.8-2.5-3-5.2-0.8-8.1c3-3.9,6.1-4.3,8.3-0.7C60.3,64.7,60.1,65.2,60.1,65.8z M109.8,204.6c-0.2-1.2,0-2.3,0.5-3.4c1.1-2.1,3.1-3,5.4-2.2c2.2,0.7,3.6,2.4,3.6,4.8c-0.1,2.8-2.6,4.7-5.3,4.2C111.4,207.6,110.1,206.5,109.8,204.6z M131.2,192.3c0-0.7,0.1-1.3,0.3-1.9c0.9-2.3,3-3.2,5.2-2.3c2.2,1,3.3,2.8,2.8,5.1c-0.4,2.5-2.8,4.1-5,3.4C132.5,196.1,131.4,194.5,131.2,192.3z M86.8,179.6c0-1.1,0.2-2.1,0.9-3c1.5-2,3.3-2.6,5.6-1.4c2.1,1.2,2.8,3,2.2,5.3c-0.8,3.2-3.7,4.3-6.2,2.4C87.9,181.9,86.9,180.9,86.8,179.6z M168.4,228.4c1.5-0.7,2.8-1.5,4.3-2c3.5-1.2,6.5,0.4,7.6,3.6c1.1,3.5-0.6,7.5-3.6,8.6c-3.1,1.1-6.5,0.2-8.3-2.2C166.6,234,166.6,229.3,168.4,228.4z M987,196.4c0-0.6,0.1-1.2,0.3-1.8c0.7-2.3,2.6-3.4,4.9-2.8c2.4,0.6,3.6,2.5,3,5c-0.6,2.5-3.1,3.6-5.3,2.8C988.4,199,987.1,197.8,987,196.4z M961.4,196.4c0.5-2.1,2.2-3.6,4.5-3.5c2.3,0.1,4.3,1.8,4.3,4c-0.1,2.3-2.2,4.1-4.5,4.1C963.6,201,961.3,198.8,961.4,196.4z M956.4,213.9c0.5-2,2.3-3.3,4.5-3c2.3,0.3,4,2.2,3.7,4.5c-0.3,2.2-2.6,3.8-4.8,3.3C957.6,218.4,956.3,216.3,956.4,213.9z M919.8,206.5c-0.1-2.4,1.8-4.4,4.3-4.5c2.4-0.1,4.6,1.8,4.6,4.3c0,2.5-2.1,4.5-4.5,4.5C921.9,210.8,919.8,208.9,919.8,206.5z m359.7-44.5c4.7,0.7,9.3,0.6,13.9,2.8c3.2,1.5,6.1,4.4,5.9,8.7c-0.1,4.5-2.6,7.9-6.3,10c-5.2,2.8-10.7,4-16.5,2.4c-6.1-1.7-8.9-6-8.9-12c0.1-6.4,4.5-10.6,10.7-11.8c0.4-0.1,0.8-0.1,1.2-0.1z M861.3,495.7c-5.7-0.1-11.4-0.2-17.1-0.2c-41,0-82.1,0.1-123.1,0.1c-143.7,0-287.4,0.1-431.1,0.1c-30,0-59.9,0.1-89.9,0c-11.1-0.1-17.6-5.4-17.8-15c-0.1-4.1,0.5-8.1,1.4-12.1c2-8.3,4-16.7,6.3-24.9c2.1-7.5,4.3-15.1,7.2-22.3c2.7-6.8,0.7-12.2-6.2-13.8c-2.3-0.5-4.7-0.7-7-0.8c-12.2-0.6-24.2-2-36.2-4.1c-17.6-3.1-33.1-10.3-44.8-24.5c-11.2-13.7-16-29.2-14.9-46.7c1-15.5,6.9-29,18-39.7c6.2-6,13.1-10.9,21-14.1c11.5-4.6,23.3-7.7,35.6-9.1c10-1.1,19.3,1.3,27,8.4c3.1,2.9,6.5,3.7,10.6,3.5c4.2-0.2,7.2,1.1,9.4,4.7c2.1,3.4,1.8,6.8-0.9,9.9c-1.8,2.1-1.4,5.3,1,7c4.6,3.2,8.6,1.4,11.8-2.6c1.1-1.5,1.7-3.4,2-5.3c0.7-4.1-1-7.1-5-8.4c-2-0.6-4.2-0.8-6.3-1c-7.9-0.5-14.7-3.6-19.9-10.2c-5.5-6.8-5.8-14.4-1-21.7c4.3-6.5,10.4-10.3,17.1-12.5c8.9-2.9,18.1-4.9,27.4-5.9c7.9-0.8,11.3,4.4,12.5,11c1.1,5.8-0.3,11.2-4.4,15.6c-1.2,1.3-3.1,1.9-4,3.4c-0.6,1-2.4,1.5-2.6,2.5c-0.3,1-0.2,2.4,0.4,3.2c6.1,8.1,14.6,12,24.8,12.4c17.5,0.7,35,1.3,52.5,2.1c13.7,0.6,26.8-2.5,38.9-8.9c14.2-7.5,23.7-18.7,29.3-33.8c3.2-8.5,4-17.4,4.5-26.4c0.1-1.9,0.3-3.8,0.7-5.5c2.4-11,8.1-19.8,16.6-26.7c7.4-6.1,15.8-10.2,25.4-11.4c6.3-0.8,12-0.2,17,3.9c2,1.6,4.6,3,6.3,5.1c1.8,2.2,0.1,5.3,2.4,7.4c1,1,2.8,1.4,4.3,1.5c15,.7,30.1,1.4,45.1,2c13.3,.6,26.1-2.4,38.1-8.1c11.3-5.4,20-13.6,26.5-24.3c4.6-7.5,7.1-15.6,8.1-24.3c0.3-2.6,0.3-5.2,.5-7.8c0.6-5,3.3-8.8,8.2-10.3c6.9-2.1,13.6-0.3,18.8,5.1c4.9,5.1,7.8,11.2,9.3,17.9c1,4.5,1.4,9.1,1.7,13.7c0.8,11.5,.3,23-2,34.2c-5,24.6-1.5,47.7,10.2,69.5c6,11.3,13.5,21.6,22.4,31.1c12.2,13,26.2,23.6,42,30.4c10.3,4.4,21.3,6,32.4,7c13,.7,25.7,2.2,38.2,5.7c32.7,9.3,47.7,40.1,34.8,70.6c-4.4,10.5-12.8,14-23.7,13.8c-10.1-0.2-20.1-0.3-30.2-0.5c-4.1,0-7.3,1.5-9.3,5c-2.4,4.1-3.6,8.6-4.6,13.2c-2.8,13.3-0.8,26.2,3.3,38.8c4.3,13.2,4.4,26.7,2,40.1c-2,11.2-6.1,21.7-12.4,31.2c-2.2,3.3-4.1,4.1-7.9,3.7c-4.1-0.5-8.1-0.9-12.2-0.7c-7.3,.3-12-3.1-14.7-9.8c-1.2-2.9-2.3-5.9-3.4-8.9c-6.8-18.7-14.1-37.3-17.6-56.7c-1.5-8.1-2.3-16.3-2.1-24.5c0.3-12,1.3-24,3.1-35.9c1.9-12.5,4-25,6-37.5c1.4-8.8,0.7-17.5-1.5-26.1c-2.3-9-7-16.7-13.6-23.2c-4.3-4.3-9.5-6.9-15.5-8.2c-9-2.1-18.1-3.2-27.4-3.4c-10.1-0.2-20.2-0.2-30.3-0.2c-15.5,0-31,0-46.5,.1c-1.6,0-3.3,.3-4.9,.5c-15.5,2-30.1,6.9-43.1,15.6c-4.3,2.9-8.4,6.2-12.6,9.3c-2.4,1.8-4.1,1.9-6.3,0.1c-4.1-3.3-8.6-4.1-13.8-3c-3.1,0.6-6,2.2-8.5,4.3c-1.5,1.2-3,2.4-4.5,3.6c-4.8,3.8-10.2,5.2-16.3,4.4c-10.3-1.4-18.1-11-17.3-21.3c0.7-8.3,6.2-15.1,14.2-17.8c3.4-1.2,7.1-1.2,10.6-2.1c4.5-1.1,8.3-3.6,11.4-7c6.1-6.6,11.7-13.7,16.8-21.2c4.4-6.5,9.4-12.7,18.4-12.3c2.4,0.1,4.3,2.5,5.1,5c0.7,2.3,.3,4.9-0.8,7.3c-3.1,6.8-7.8,12.5-13.8,17c-1.1,0.8-1.5,1.1-0.7,2.5c4.7,8.2,10.1,15.9,17,22.5c6,5.7,12.9,10,21.1,11.5c4.4,0.8,8.2,3.1,10.2,7.3c2.3,4.6,1.4,9.1-2.1,13c-3.4,3.7-8,5.4-12.8,4.7c-9.1-1.3-15.8-6.1-20.9-13.6c-1-1.5-1.9-1.6-3.4-0.8c-10,5.4-20.9,7.3-32.2,6c-13.2-1.5-24.9-6.3-34.9-15.1c-1.9-1.7-3.6-1.5-5.4,0.3c-8.4,8.5-18.7,13-30.7,13.8c-13,.9-24.8-2.6-34.7-11.2c-2.4-2.1-4.7-1.9-7,0.3c-10,9.9-22.3,14.6-36.4,15.3c-143.7,7.1-287.4,14.3-431.1,21.4c-30,1.5-59.9,2.9-89.9,4.4c-11.1,.5-17.7,5.9-17.9,15.6c-0.1,4.1,.5,8.1,1.4,12.1c2,8.3,4,16.7,6.3,24.9c2.1,7.5,4.3,15.1,7.2,22.3c2.7,6.8,.7,12.2-6.2,13.8"
                                fill="#f8f8f8"
                                stroke="#000000"
                                strokeWidth="1.5"
                            />

                            {/* High Needs - Africa Zone */}
                            <circle cx="515" cy="270" r="45" className="impact-zone pulse-slow" />
                            <circle cx="515" cy="270" r="10" className="zone-marker" />
                            <text x="530" y="275" className="zone-label">Sub-Saharan Africa</text>

                            {/* Critical - South Asia Zone */}
                            <circle cx="700" cy="200" r="40" className="impact-zone pulse-fast" />
                            <circle cx="700" cy="200" r="10" className="zone-marker" />
                            <text x="715" y="205" className="zone-label">South Asia</text>

                            {/* High - Central & South America */}
                            <circle cx="280" cy="300" r="35" className="impact-zone pulse-slow" />
                            <circle cx="280" cy="300" r="8" className="zone-marker" />
                            <text x="180" y="305" className="zone-label">Central America</text>

                            {/* Emerging Zone - Middle East */}
                            <circle cx="580" cy="200" r="25" className="impact-zone pulse-slow" />
                            <circle cx="580" cy="200" r="6" className="zone-marker" />
                            <text x="595" y="205" className="zone-label">Middle East</text>
                        </svg>
                    </div>
                </div>

                <div className="stats-panel">
                    <h3>Priority Zones</h3>
                    <div className="zone-list">
                        {impactZones.map((zone, i) => (
                            <div key={i} className="zone-item">
                                <div className="zone-info">
                                    <FaMapMarkerAlt className="marker" />
                                    <div>
                                        <h4>{zone.name}</h4>
                                        <p>{zone.priority}</p>
                                    </div>
                                </div>
                                <div className="zone-badge" data-need={zone.need.toLowerCase()}>
                                    {zone.need}
                                </div>
                            </div>
                        ))}
                    </div>

                    <button className="donate-action" onClick={() => navigate("/")}>
                        Donate to Urgent Relief <FaChevronRight />
                    </button>
                </div>
            </div>

            {/* FOOTER */}
            <footer className="simple-footer">
                <p>© 2026 DonateX. Empowering change through transparency.</p>
            </footer>
        </div>
    );
}
