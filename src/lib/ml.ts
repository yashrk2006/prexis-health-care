// ML inference in TypeScript using pre-trained Logistic Regression coefficients
// Train the model: python train_model.py (from frontend/ directory)

import modelData from "./model_data.json";

export interface PatientInput {
  gender: string;
  age: number;
  hypertension: number;
  heart_disease: number;
  smoking_history: string;
  bmi: number;
  HbA1c_level: number;
  blood_glucose_level: number;
}

export interface PredictionResult {
  risk_score: number;
  risk_label: "Low Risk" | "Moderate Risk" | "High Risk" | "Critical Risk";
  risk_color: string;
  probability: number;
  top_factors: { feature: string; importance: number }[];
  feature_importances: { [key: string]: number };
}

const GENDER_MAP: { [key: string]: number } = { Female: 0, Male: 1, Other: 0.5 };
const SMOKING_MAP: { [key: string]: number } = {
  "No Info": 0, never: 1, former: 2, "not current": 2, ever: 3, current: 4,
};

function sigmoid(x: number): number {
  return 1 / (1 + Math.exp(-x));
}

function encodeFeatures(patient: PatientInput): number[] {
  return [
    GENDER_MAP[patient.gender] ?? 0,
    patient.age,
    patient.hypertension,
    patient.heart_disease,
    SMOKING_MAP[patient.smoking_history] ?? 0,
    patient.bmi,
    patient.HbA1c_level,
    patient.blood_glucose_level,
  ];
}

function standardize(features: number[]): number[] {
  return features.map(
    (val, i) => (val - modelData.scaler_mean[i]) / modelData.scaler_scale[i]
  );
}

export function predict(patient: PatientInput): PredictionResult {
  const raw = encodeFeatures(patient);
  const scaled = standardize(raw);

  // Logistic Regression: z = X · coef + intercept → sigmoid(z)
  const z =
    scaled.reduce((sum, val, i) => sum + val * modelData.coef[i], 0) +
    modelData.intercept;
  const probability = sigmoid(z);
  const risk_score = Math.round(probability * 1000) / 10;

  let risk_label: PredictionResult["risk_label"];
  let risk_color: string;
  if (risk_score < 20) { risk_label = "Low Risk"; risk_color = "green"; }
  else if (risk_score < 45) { risk_label = "Moderate Risk"; risk_color = "yellow"; }
  else if (risk_score < 70) { risk_label = "High Risk"; risk_color = "orange"; }
  else { risk_label = "Critical Risk"; risk_color = "red"; }

  const feature_importances = modelData.feature_importances as { [key: string]: number };
  const top_factors = Object.entries(feature_importances)
    .map(([feature, importance]) => ({ feature, importance }))
    .sort((a, b) => b.importance - a.importance)
    .slice(0, 5);

  return { risk_score, risk_label, risk_color, probability, top_factors, feature_importances };
}
