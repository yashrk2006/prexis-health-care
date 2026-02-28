import { NextRequest, NextResponse } from "next/server";
import { predict, PatientInput } from "@/lib/ml";
import { savePrediction } from "@/lib/supabase";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY ?? "");

async function getGeminiExplanation(patient: PatientInput, result: ReturnType<typeof predict>) {
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        const prompt = `You are a clinical AI assistant. A patient has been assessed for diabetes risk.

Patient Profile:
- Gender: ${patient.gender}, Age: ${patient.age}
- BMI: ${patient.bmi}, HbA1c: ${patient.HbA1c_level}%, Blood Glucose: ${patient.blood_glucose_level} mg/dL
- Hypertension: ${patient.hypertension ? "Yes" : "No"}, Heart Disease: ${patient.heart_disease ? "Yes" : "No"}
- Smoking: ${patient.smoking_history}

ML Prediction: ${result.risk_score}% risk — ${result.risk_label}
Top Factors: ${result.top_factors.map(f => `${f.feature} (${f.importance}%)`).join(", ")}

Return ONLY this JSON (no markdown):
{
  "summary": "2-3 sentence plain-English risk summary",
  "risk_factors": [{"factor": "name", "detail": "explanation"}],
  "recommendations": ["rec1", "rec2", "rec3"],
  "lifestyle_tips": ["tip1", "tip2"],
  "doctor_note": "brief clinical note"
}`;

        const response = await model.generateContent(prompt);
        let text = response.response.text().trim();
        if (text.startsWith("```")) {
            text = text.replace(/```json?\n?/g, "").replace(/```/g, "").trim();
        }
        return JSON.parse(text);
    } catch (e) {
        return {
            summary: `Patient shows ${result.risk_label} for diabetes (${result.risk_score}%) based on ML analysis.`,
            risk_factors: result.top_factors.map(f => ({ factor: f.feature, detail: `${f.importance}% model weight` })),
            recommendations: ["Consult a physician", "Monitor blood glucose", "Maintain healthy BMI"],
            lifestyle_tips: ["30 min exercise daily", "Reduce refined sugars"],
            doctor_note: `ML model: ${result.risk_score}% diabetes risk. Clinical evaluation recommended.`
        };
    }
}

export async function POST(req: NextRequest) {
    try {
        const patient = await req.json() as PatientInput;
        const prediction = predict(patient);
        const explanation = await getGeminiExplanation(patient, prediction);
        const fullResult = { ...prediction, explanation };
        await savePrediction(patient as unknown as Record<string, unknown>, fullResult as unknown as Record<string, unknown>);
        return NextResponse.json(fullResult);
    } catch (e) {
        return NextResponse.json({ error: String(e) }, { status: 500 });
    }
}
