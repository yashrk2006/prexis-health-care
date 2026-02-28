"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const SMOKING_OPTIONS = ["never", "No Info", "former", "not current", "ever", "current"];

interface FormState {
    gender: string;
    age: string;
    hypertension: number;
    heart_disease: number;
    smoking_history: string;
    bmi: string;
    HbA1c_level: string;
    blood_glucose_level: string;
}

export default function AssessPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [form, setForm] = useState<FormState>({
        gender: "Male",
        age: "45",
        hypertension: 0,
        heart_disease: 0,
        smoking_history: "never",
        bmi: "28",
        HbA1c_level: "6.0",
        blood_glucose_level: "140",
    });

    const set = (key: keyof FormState, val: string | number) =>
        setForm((f) => ({ ...f, [key]: val }));

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        try {
            const payload = {
                gender: form.gender,
                age: parseFloat(form.age),
                hypertension: form.hypertension,
                heart_disease: form.heart_disease,
                smoking_history: form.smoking_history,
                bmi: parseFloat(form.bmi),
                HbA1c_level: parseFloat(form.HbA1c_level),
                blood_glucose_level: parseFloat(form.blood_glucose_level),
            };
            const res = await fetch("/api/predict", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });
            if (!res.ok) throw new Error("Prediction failed");
            const data = await res.json();
            sessionStorage.setItem("prediction", JSON.stringify(data));
            sessionStorage.setItem("patient", JSON.stringify(payload));
            router.push("/result");
        } catch {
            setError("Assessment failed. Please try again.");
            setLoading(false);
        }
    };

    return (
        <>
            <nav className="navbar">
                <div className="navbar-inner">
                    <Link href="/" className="navbar-logo">
                        <div className="logo-dot" />
                        <span>ClinicalAI</span>
                    </Link>
                    <div className="navbar-actions">
                        <Link href="/history" className="nav-link">History</Link>
                    </div>
                </div>
            </nav>

            <div className="form-page">
                <div className="form-container">
                    <div className="form-header">
                        <div className="badge" style={{ marginBottom: "1rem" }}>Step 1 of 1</div>
                        <h1 className="form-title">Patient Assessment</h1>
                        <p className="form-subtitle">Enter clinical measurements to generate an AI-powered diabetes risk evaluation</p>
                    </div>

                    <form onSubmit={handleSubmit} className="form-card">
                        <div className="form-grid">

                            {/* Gender */}
                            <div className="form-group">
                                <label className="form-label">Gender</label>
                                <div className="toggle-row">
                                    {["Male", "Female"].map((g) => (
                                        <button
                                            key={g}
                                            type="button"
                                            className={`toggle-btn ${form.gender === g ? "active" : ""}`}
                                            onClick={() => set("gender", g)}
                                        >{g}</button>
                                    ))}
                                </div>
                            </div>

                            {/* Age */}
                            <div className="form-group">
                                <label className="form-label">Age (years)</label>
                                <div className="range-row">
                                    <input
                                        type="range" min={0} max={100} step={1}
                                        className="form-range"
                                        value={form.age}
                                        onChange={(e) => set("age", e.target.value)}
                                    />
                                    <span className="range-value">{form.age}y</span>
                                </div>
                            </div>

                            {/* Hypertension */}
                            <div className="form-group">
                                <label className="form-label">Hypertension</label>
                                <div className="toggle-row">
                                    {["No", "Yes"].map((v, i) => (
                                        <button
                                            key={v}
                                            type="button"
                                            className={`toggle-btn ${form.hypertension === i ? "active" : ""}`}
                                            onClick={() => set("hypertension", i)}
                                        >{v}</button>
                                    ))}
                                </div>
                            </div>

                            {/* Heart Disease */}
                            <div className="form-group">
                                <label className="form-label">Heart Disease</label>
                                <div className="toggle-row">
                                    {["No", "Yes"].map((v, i) => (
                                        <button
                                            key={v}
                                            type="button"
                                            className={`toggle-btn ${form.heart_disease === i ? "active" : ""}`}
                                            onClick={() => set("heart_disease", i)}
                                        >{v}</button>
                                    ))}
                                </div>
                            </div>

                            {/* Smoking */}
                            <div className="form-group full-width">
                                <label className="form-label">Smoking History</label>
                                <div className="smoking-grid">
                                    {SMOKING_OPTIONS.map((s) => (
                                        <button
                                            key={s}
                                            type="button"
                                            className={`toggle-btn ${form.smoking_history === s ? "active" : ""}`}
                                            onClick={() => set("smoking_history", s)}
                                        >{s}</button>
                                    ))}
                                </div>
                            </div>

                            {/* BMI */}
                            <div className="form-group">
                                <label className="form-label">BMI</label>
                                <div className="range-row">
                                    <input
                                        type="range" min={10} max={70} step={0.1}
                                        className="form-range"
                                        value={form.bmi}
                                        onChange={(e) => set("bmi", e.target.value)}
                                    />
                                    <span className="range-value">{parseFloat(form.bmi).toFixed(1)}</span>
                                </div>
                            </div>

                            {/* HbA1c */}
                            <div className="form-group">
                                <label className="form-label">HbA1c Level (%)</label>
                                <div className="range-row">
                                    <input
                                        type="range" min={3} max={15} step={0.01}
                                        className="form-range"
                                        value={form.HbA1c_level}
                                        onChange={(e) => set("HbA1c_level", e.target.value)}
                                    />
                                    <span className="range-value">{parseFloat(form.HbA1c_level).toFixed(1)}%</span>
                                </div>
                            </div>

                            {/* Blood Glucose */}
                            <div className="form-group full-width">
                                <label className="form-label">Blood Glucose Level (mg/dL)</label>
                                <div className="range-row">
                                    <input
                                        type="range" min={50} max={500} step={1}
                                        className="form-range"
                                        value={form.blood_glucose_level}
                                        onChange={(e) => set("blood_glucose_level", e.target.value)}
                                    />
                                    <span className="range-value">{form.blood_glucose_level}</span>
                                </div>
                                <div className="glucose-refs">
                                    <span className="ref ref-safe">Normal &lt;100</span>
                                    <span className="ref ref-warn">Pre-diabetic 100-125</span>
                                    <span className="ref ref-danger">Diabetic &gt;126</span>
                                </div>
                            </div>

                        </div>

                        {error && <div className="error-msg">{error}</div>}

                        <div className="form-footer">
                            <button type="submit" className="submit-btn" disabled={loading}>
                                {loading ? (
                                    <><div className="spinner-sm" /> Analyzing...</>
                                ) : (
                                    <>Run AI Assessment →</>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </>
    );
}
