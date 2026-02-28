"use client";
import Link from "next/link";
import { useState, useEffect } from "react";

const stats = [
  { value: "100K+", label: "Training Records" },
  { value: "94%", label: "AUC-ROC Score" },
  { value: "8", label: "Clinical Features" },
];

const features = [
  { icon: "🧠", title: "ML-Powered Risk Score", desc: "Logistic Regression trained on 100,000+ diabetes records gives you a precise probability score with clinical confidence." },
  { icon: "✨", title: "Gemini AI Explanations", desc: "Google Gemini 1.5 Flash translates complex ML outputs into clear, actionable insights for both clinicians and patients." },
  { icon: "📊", title: "Feature Importance Analysis", desc: "Understand exactly which health factors contributed most to the risk prediction with visual breakdowns." },
  { icon: "🗂️", title: "Patient History", desc: "Every assessment is securely stored in Supabase, giving you a longitudinal view of patient risk over time." },
  { icon: "📱", title: "Works Everywhere", desc: "Fully responsive from mobile to desktop. Perfect for OPD workflows, bedside tablets, or patient self-service kiosks." },
  { icon: "⚡", title: "Instant Results", desc: "Sub-second ML inference with serverless architecture. No waiting, no latency — just instant clinical intelligence." },
];

export default function HomePage() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handler);
    return () => window.removeEventListener("scroll", handler);
  }, []);

  return (
    <>
      <nav className={`navbar ${scrolled ? "navbar-scrolled" : ""}`}>
        <div className="navbar-inner">
          <div className="navbar-logo">
            <div className="logo-dot" />
            <span>ClinicalAI</span>
          </div>
          <div className="navbar-actions">
            <Link href="/history" className="nav-link">History</Link>
            <Link href="/assess" className="btn btn-primary">Assess Patient →</Link>
          </div>
        </div>
      </nav>

      <main>
        {/* Hero */}
        <section className="hero">
          <div className="hero-bg">
            <div className="hero-orb hero-orb-1" />
            <div className="hero-orb hero-orb-2" />
            <div className="hero-orb hero-orb-3" />
          </div>
          <div className="hero-content">
            <div className="badge">
              <span>🏥</span> Praxis 2.0 · PS1 · Clinical Decision Support
            </div>
            <h1 className="hero-title">
              Predict Diabetes Risk<br />with <span>AI Precision</span>
            </h1>
            <p className="hero-desc">
              Combine the power of Machine Learning and Gemini AI to surface early
              risk signals from routine patient data — enabling timely, informed interventions.
            </p>
            <div className="hero-cta">
              <Link href="/assess" className="btn btn-emerald btn-lg">
                Start Assessment →
              </Link>
              <Link href="/history" className="btn btn-outline btn-lg">
                View History
              </Link>
            </div>
            <div className="hero-stats">
              {stats.map((s) => (
                <div key={s.label} className="stat">
                  <div className="stat-value">{s.value}</div>
                  <div className="stat-label">{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="features">
          <div className="container">
            <div className="section-header">
              <h2 className="section-title">Built for Clinical Intelligence</h2>
              <p className="section-sub">Every feature designed to support better patient outcomes</p>
            </div>
            <div className="cards-grid">
              {features.map((f) => (
                <div key={f.title} className="card">
                  <div className="card-icon">{f.icon}</div>
                  <div className="card-title">{f.title}</div>
                  <div className="card-desc">{f.desc}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Banner */}
        <section className="cta-section">
          <div className="container">
            <div className="cta-card">
              <h2 className="cta-title">Ready to assess a patient?</h2>
              <p className="cta-desc">Input 8 clinical values. Get an AI-powered risk assessment in seconds.</p>
              <Link href="/assess" className="btn btn-emerald btn-lg">
                Start Now →
              </Link>
            </div>
          </div>
        </section>
      </main>

      <footer className="footer">
        <div className="container">
          <div className="footer-inner">
            <div className="navbar-logo">
              <div className="logo-dot" />
              <span>ClinicalAI</span>
            </div>
            <p className="footer-text">Praxis 2.0 · Built with ML + Gemini AI</p>
          </div>
        </div>
      </footer>
    </>
  );
}
