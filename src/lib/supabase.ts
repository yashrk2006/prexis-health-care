import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseKey);

export async function savePrediction(patientData: Record<string, unknown>, result: Record<string, unknown>) {
    try {
        const { data, error } = await supabase
            .from("predictions")
            .insert([{ patient_data: patientData, risk_score: result.risk_score, risk_label: result.risk_label, gemini_explanation: result.explanation }])
            .select()
            .single();
        if (error) throw error;
        return data;
    } catch (e) {
        console.warn("Supabase save failed:", e);
        return null;
    }
}

export async function getHistory(limit = 20) {
    try {
        const { data, error } = await supabase
            .from("predictions")
            .select("*")
            .order("created_at", { ascending: false })
            .limit(limit);
        if (error) throw error;
        return data ?? [];
    } catch (e) {
        console.warn("Supabase fetch failed:", e);
        return [];
    }
}
