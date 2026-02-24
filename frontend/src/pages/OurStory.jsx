import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaChevronLeft, FaLightbulb, FaRocket, FaHandsHelping, FaGlobe, FaCertificate } from "react-icons/fa";
import donatexLogo from "../assets/donatexlogo.png";
import "./OurStory.css";

export default function OurStory() {
    const navigate = useNavigate();

    const storySteps = [
        {
            id: 1,
            icon: <FaLightbulb />,
            year: "The Beginning",
            title: "The Spark of Innovation",
            content: "It all started when our founder, Soosanna, noticed a profound disconnect between selfless donors and the NGOs that needed them. The lack of transparency was a barrier to change.",
            image: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&q=80"
        },
        {
            id: 2,
            icon: <FaHandsHelping />,
            year: "The Foundation",
            title: "Building Trust",
            content: "The first line of code was written with a single goal: Transparency. We developed the NGO verification system to ensure every rupee donated reaches its intended destination.",
            image: "https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&q=80"
        },
        {
            id: 3,
            icon: <FaRocket />,
            year: "The Launch",
            title: "DonateX Goes Live",
            content: "Launching the platform was a milestone. We welcomed our first 10 verified NGOs and processed our first donation within hours. The community's response was overwhelming.",
            image: "https://images.unsplash.com/photo-1559136555-9303baea8ebd?auto=format&fit=crop&q=80"
        },
        {
            id: 4,
            icon: <FaGlobe />,
            year: "The Expansion",
            title: "Visualizing Impact",
            content: "We realized that donors wanted to see the scale of their kindness. Thus, the World Impact Map was born, showing the ripples of hope across continents.",
            image: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80"
        },
        {
            id: 5,
            icon: <FaCertificate />,
            year: "Today & Beyond",
            title: "Our Ongoing Mission",
            content: "DonateX is no longer just a platform; it's a movement. We continue to innovate, bringing donors and NGOs together to build a world defined by kindness and integrity.",
            image: "https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&q=80"
        }
    ];

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    return (
        <div className="story-container">
            {/* MINIMAL NAVBAR */}
            <nav className="story-navbar">
                <div className="story-logo" onClick={() => navigate("/")}>
                    <img src={donatexLogo} alt="DonateX" />
                    <span>DonateX</span>
                </div>
                <button className="back-btn" onClick={() => navigate("/about")}>
                    <FaChevronLeft /> Back to About Us
                </button>
            </nav>

            {/* HERO SECTION */}
            <header className="story-hero">
                <div className="hero-overlay-curved"></div>
                <div className="hero-content">
                    <span className="sc-subtitle">Our Journey</span>
                    <h1>The Story of <span>DonateX</span></h1>
                    <p>From a simple observation to a global movement for change.</p>
                </div>
            </header>

            {/* STORYLINE CONTENT */}
            <div className="storyline-wrapper">
                <div className="timeline-line"></div>
                {storySteps.map((step, index) => (
                    <div key={step.id} className={`story-step ${index % 2 !== 0 ? "reversed" : ""}`}>
                        <div className="story-image">
                            <img src={step.image} alt={step.title} />
                            <div className="year-badge">{step.year}</div>
                        </div>
                        <div className="story-node">
                            <div className="node-icon">{step.icon}</div>
                        </div>
                        <div className="story-text">
                            <h3>{step.title}</h3>
                            <p>{step.content}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* FINAL QUOTE */}
            <section className="story-footer-section">
                <div className="f-quote-card">
                    <p>"DonateX wasn't just built on code; it was built on empathy. We are just getting started."</p>
                    <span>– The Team at DonateX</span>
                </div>
                <button className="start-journey-btn" onClick={() => navigate("/")}>
                    Be Part of Our Journey
                </button>
            </section>

            {/* COMPACT FOOTER */}
            <footer className="story-footer">
                <p>© 2026 DonateX. Created with heart and code.</p>
            </footer>
        </div>
    );
}
