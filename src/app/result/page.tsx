"use client";
import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface TopFactor { feature: string; importance: number; }
interface Explanation {
    summary: string;
    risk_factors: { factor: string; detail: string }[];
    recommendations: string[];
    lifestyle_tips: string[];
    doctor_note: string;
}
interface Prediction {
    risk_score: number;
    risk_label: string;
    risk_color: string;
    top_factors: TopFactor[];
    feature_importances: Record<string, number>;
    explanation: Explanation;
}

const RISK_COLORS: Record<string, string> = {
    green: "#10B981", yellow: "#F59E0B", orange: "#F97316", red: "#EF4444",
};

const CIRCUMFERENCE = 2 * Math.PI * 54;

function GaugeChart({ score, color }: { score: number; color: string }) {
    const [animated, setAnimated] = useState(0);
    useEffect(() => {
        const t = setTimeout(() => setAnimated(score), 100);
        return () => clearTimeout(t);
    }, [score]);
    const fill = CIRCUMFERENCE - (animated / 100) * CIRCUMFERENCE;
    return (
        <div className="gauge-wrapper">
            <svg className="gauge-svg" viewBox="0 0 120 120">
                <circle className="gauge-bg" cx="60" cy="60" r="54" />
                <circle
                    className="gauge-fill"
                    cx="60" cy="60" r="54"
                    stroke={RISK_COLORS[color]}
                    strokeDasharray={CIRCUMFERENCE}
                    strokeDashoffset={fill}
                />
            </svg>
            <div className="gauge-text">
                <span className="gauge-pct" style={{ color: RISK_COLORS[color] }}>
                    {animated.toFixed(1)}%
                </span>
                <span className="gauge-label">Risk</span>
            </div>
        </div>
    );
}

export default function ResultPage() {
    const router = useRouter();
    const [data, setData] = useState<Prediction | null>(null);
    const [activeTab, setActiveTab] = useState(0);

    useEffect(() => {
        const raw = sessionStorage.getItem("prediction");
        if (!raw) { router.push("/assess"); return; }
        setData(JSON.parse(raw));
    }, [router]);

    if (!data) return (
        <div className="loading-state" style={{ minHeight: "100vh" }}>
            <div className="spinner" />
            <span className="loading-text">Loading results...</span>
        </div>
    );

    const riskClass = data.risk_color === "green" ? "low"
        : data.risk_color === "yellow" ? "moderate"
            : data.risk_color === "orange" ? "high" : "critical";

    const tabs = ["Summary", "Risk Factors", "Recommendations", "Doctor's Note"];
    const maxImportance = Math.max(...Object.values(data.feature_importances));

    return (
        <>
            <nav className="navbar">
                <div className="navbar-inner">
                    <Link href="/" className="navbar-logo">
                        <div className="logo-dot" />
                        <span>ClinicalAI</span>
                    </Link>
                    <div className="navbar-actions">
                        <Link href="/assess" className="nav-link">New Assessment</Link>
                        <Link href="/history" className="btn btn-primary">History</Link>
                    </div>
                </div>
            </nav>

            <div className="result-page">
                <div className="result-container">

                    {/* Risk Hero Card */}
                    <div className="risk-hero">
                        <GaugeChart score={data.risk_score} color={data.risk_color} />
                        <div className="risk-info">
                            <div className={`risk-badge ${riskClass}`}>
                                <span>
                                    {riskClass === "low" ? "✅" : riskClass === "moderate" ? "⚠️" : riskClass === "high" ? "🔶" : "🚨"}
                                </span>
                                {data.risk_label}
                            </div>
                            <h1 className="risk-title">{data.risk_score.toFixed(1)}% Diabetes Risk</h1>
                            <p className="risk-desc">
                                {data.explanation?.summary}
                            </p>
                        </div>
                    </div>

                    {/* Info Grid */}
                    <div className="info-grid">
                        {/* Feature Importances */}
                        <div className="info-card" style={{ "--delay": "0.1s" } as React.CSSProperties}>
                            <div className="info-card-title">Feature Importance</div>
                            {Object.entries(data.feature_importances)
                                .sort(([, a], [, b]) => b - a)
                                .map(([key, val]) => (
                                    <div className="factor-item" key={key}>
                                        <div className="factor-header">
                                            <span className="factor-name">{key.replace(/_/g, " ")}</span>
                                            <span className="factor-pct">{val.toFixed(1)}%</span>
                                        </div>
                                        <div className="factor-bar">
                                            <div
                                                className="factor-fill"
                                                style={{ width: `${(val / maxImportance) * 100}%` }}
                                            />
                                        </div>
                                    </div>
                                ))}
                        </div>

                        {/* AI Explanation */}
                        <div className="info-card" style={{ "--delay": "0.2s" } as React.CSSProperties}>
                            <div className="info-card-title">AI Clinical Insights</div>
                            <div className="tabs">
                                {tabs.map((t, i) => (
                                    <button
                                        key={t}
                                        className={`tab-btn ${activeTab === i ? "active" : ""}`}
                                        onClick={() => setActiveTab(i)}
                                    >{t}</button>
                                ))}
                            </div>

                            {activeTab === 0 && (
                                <p style={{ fontSize: "0.9rem", color: "var(--gray-800)", lineHeight: 1.7 }}>
                                    {data.explanation?.summary}
                                </p>
                            )}
                            {activeTab === 1 && (
                                <ul className="rec-list">
                                    {data.explanation?.risk_factors?.map((rf, i) => (
                                        <li key={i} className="rec-item">
                                            <span className="rec-icon">⚡</span>
                                            <div>
                                                <strong style={{ fontSize: "0.85rem" }}>{rf.factor}:</strong>{" "}
                                                <span style={{ fontSize: "0.85rem" }}>{rf.detail}</span>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            )}
                            {activeTab === 2 && (
                                <ul className="rec-list">
                                    {[...(data.explanation?.recommendations ?? []), ...(data.explanation?.lifestyle_tips ?? [])].map((r, i) => (
                                        <li key={i} className="rec-item">
                                            <span className="rec-icon">✅</span>
                                            {r}
                                        </li>
                                    ))}
                                </ul>
                            )}
                            {activeTab === 3 && (
                                <div style={{
                                    background: "var(--off-white)",
                                    borderRadius: "var(--radius-md)",
                                    padding: "var(--space-md)",
                                    borderLeft: "3px solid var(--coral)",
                                    fontSize: "0.9rem",
                                    lineHeight: 1.7,
                                    color: "var(--gray-800)",
                                }}>
                                    🩺 {data.explanation?.doctor_note}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="actions-row">
                        <Link href="/assess" className="btn btn-primary btn-lg">← New Assessment</Link>
                        <Link href="/history" className="btn btn-outline btn-lg">View History</Link>
                        <button
                            className="btn btn-emerald btn-lg"
                            onClick={() => window.print()}
                        >🖨️ Print Report</button>
                    </div>
                </div>
            </div>
        </>
    );
}
