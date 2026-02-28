"""
Train diabetes model locally and export coefficients as JSON for Next.js inference.
Run: python train_model.py
Output: src/lib/model_data.json
"""
import pandas as pd
import numpy as np
from sklearn.linear_model import LogisticRegression
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import StandardScaler
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, roc_auc_score, classification_report
import json
import os

DATASET_PATH = "../../Problem-Statements-Praxis-2-0/Problem_Statement_1/diabetes_dataset.csv"
OUTPUT_PATH = "src/lib/model_data.json"

GENDER_MAP = {"Female": 0, "Male": 1, "Other": 0.5}
SMOKING_MAP = {"No Info": 0, "never": 1, "former": 2, "not current": 2, "ever": 3, "current": 4}
FEATURE_COLS = ["gender", "age", "hypertension", "heart_disease", "smoking_history",
                "bmi", "HbA1c_level", "blood_glucose_level"]

def preprocess(df):
    df = df.copy()
    df["gender"] = df["gender"].map(lambda x: GENDER_MAP.get(x, 0))
    df["smoking_history"] = df["smoking_history"].map(lambda x: SMOKING_MAP.get(x, 0))
    return df[FEATURE_COLS].astype(float)

print("[INFO] Loading dataset...")
df = pd.read_csv(DATASET_PATH)
print(f"[INFO] Loaded {len(df):,} rows")

X = preprocess(df)
y = df["diabetes"]

X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42, stratify=y)

# Scale features
scaler = StandardScaler()
X_train_sc = scaler.fit_transform(X_train)
X_test_sc = scaler.transform(X_test)

# Train Logistic Regression (exports easily as coefficients)
print("[INFO] Training Logistic Regression...")
lr = LogisticRegression(max_iter=1000, random_state=42, class_weight="balanced", C=1.0)
lr.fit(X_train_sc, y_train)

lr_acc = accuracy_score(y_test, lr.predict(X_test_sc))
lr_auc = roc_auc_score(y_test, lr.predict_proba(X_test_sc)[:, 1])
print(f"LR → Accuracy: {lr_acc:.4f} | AUC-ROC: {lr_auc:.4f}")

# Train Random Forest for feature importances
print("[INFO] Training Random Forest for feature importances...")
rf = RandomForestClassifier(n_estimators=50, max_depth=8, random_state=42, n_jobs=-1, class_weight="balanced")
rf.fit(X_train, y_train)
rf_acc = accuracy_score(y_test, rf.predict(X_test))
rf_auc = roc_auc_score(y_test, rf.predict_proba(X_test)[:, 1])
print(f"RF  → Accuracy: {rf_acc:.4f} | AUC-ROC: {rf_auc:.4f}")

# Export everything needed for TypeScript inference
model_data = {
    "coef": lr.coef_[0].tolist(),
    "intercept": float(lr.intercept_[0]),
    "scaler_mean": scaler.mean_.tolist(),
    "scaler_scale": scaler.scale_.tolist(),
    "feature_names": FEATURE_COLS,
    "feature_importances": {
        col: round(float(imp * 100), 2)
        for col, imp in zip(FEATURE_COLS, rf.feature_importances_)
    },
    "gender_map": GENDER_MAP,
    "smoking_map": SMOKING_MAP,
    "metrics": {
        "lr_accuracy": round(lr_acc, 4),
        "lr_auc": round(lr_auc, 4),
        "rf_accuracy": round(rf_acc, 4),
        "rf_auc": round(rf_auc, 4),
        "training_samples": len(X_train),
    }
}

os.makedirs(os.path.dirname(OUTPUT_PATH), exist_ok=True)
with open(OUTPUT_PATH, "w") as f:
    json.dump(model_data, f, indent=2)

print(f"\n[DONE] Model exported to {OUTPUT_PATH}")
print(f"   Coefficients: {len(model_data['coef'])} features")
print(f"   Feature importances (RF): {model_data['feature_importances']}")
