"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

interface Record {
    id: number;
    patient_data: {
        gender: string; age: number; bmi: number;
        HbA1c_level: number; blood_glucose_level: number;
    };
    risk_score: number;
    risk_label: string;
    created_at: string;
}

const PILL_CLASS: Record<string, string> = {
    "Low Risk": "low", "Moderate Risk": "moderate",
    "High Risk": "high", "Critical Risk": "critical",
};

export default function HistoryPage() {
    const [records, setRecords] = useState<Record[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch("/api/history")
            .then((r) => r.json())
            .then((d) => { setRecords(d.records ?? []); setLoading(false); })
            .catch(() => setLoading(false));
    }, []);

    return (
        <>
            <nav className="navbar">
                <div className="navbar-inner">
                    <Link href="/" className="navbar-logo">
                        <div className="logo-dot" />
                        <span>ClinicalAI</span>
                    </Link>
                    <div className="navbar-actions">
                        <Link href="/assess" className="btn btn-emerald">+ New Assessment</Link>
                    </div>
                </div>
            </nav>

            <div className="history-page">
                <div className="history-container">
                    <div className="form-header" style={{ marginBottom: "var(--space-xl)" }}>
                        <h1 className="form-title">Assessment History</h1>
                        <p className="form-subtitle">
                            {records.length} patient assessment{records.length !== 1 ? "s" : ""} on record
                        </p>
                    </div>

                    {loading ? (
                        <div className="loading-state">
                            <div className="spinner" />
                            <span className="loading-text">Loading history from Supabase...</span>
                        </div>
                    ) : records.length === 0 ? (
                        <div className="empty-state">
                            <div className="empty-icon">🏥</div>
                            <h3 className="empty-title">No assessments yet</h3>
                            <p className="empty-desc">Run your first patient assessment to see records here.</p>
                            <Link href="/assess" className="btn btn-emerald btn-lg">Start Assessment →</Link>
                        </div>
                    ) : (
                        <div className="table-card">
                            <div style={{ overflowX: "auto" }}>
                                <table>
                                    <thead>
                                        <tr>
                                            <th>#</th>
                                            <th>Gender / Age</th>
                                            <th>BMI</th>
                                            <th>HbA1c</th>
                                            <th>Blood Glucose</th>
                                            <th>Risk Score</th>
                                            <th>Risk Level</th>
                                            <th>Date</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {records.map((r, i) => (
                                            <tr key={r.id}>
                                                <td style={{ color: "var(--gray-400)", fontFamily: "var(--font-mono)", fontSize: "0.8rem" }}>
                                                    {i + 1}
                                                </td>
                                                <td>{r.patient_data?.gender ?? "–"}, {r.patient_data?.age ?? "–"}y</td>
                                                <td style={{ fontFamily: "var(--font-mono)" }}>{r.patient_data?.bmi?.toFixed(1) ?? "–"}</td>
                                                <td style={{ fontFamily: "var(--font-mono)" }}>{r.patient_data?.HbA1c_level?.toFixed(1) ?? "–"}%</td>
                                                <td style={{ fontFamily: "var(--font-mono)" }}>{r.patient_data?.blood_glucose_level ?? "–"} mg/dL</td>
                                                <td>
                                                    <span style={{
                                                        fontFamily: "var(--font-mono)",
                                                        fontWeight: 700,
                                                        color: r.risk_score >= 70 ? "var(--risk-critical)"
                                                            : r.risk_score >= 45 ? "var(--risk-high)"
                                                                : r.risk_score >= 20 ? "var(--risk-moderate)" : "var(--risk-low)"
                                                    }}>
                                                        {r.risk_score?.toFixed(1) ?? "–"}%
                                                    </span>
                                                </td>
                                                <td>
                                                    <span className={`pill ${PILL_CLASS[r.risk_label] ?? "low"}`}>
                                                        {r.risk_label}
                                                    </span>
                                                </td>
                                                <td style={{ color: "var(--gray-400)", fontSize: "0.8rem" }}>
                                                    {new Date(r.created_at).toLocaleDateString("en-IN", {
                                                        day: "numeric", month: "short", year: "numeric"
                                                    })}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}
