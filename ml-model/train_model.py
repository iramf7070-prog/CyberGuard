import pandas as pd
import numpy as np
import joblib

from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import (
    accuracy_score,
    classification_report,
    confusion_matrix
)

# Real CIC-IDS2017 dataset load
data = pd.read_parquet(
    "Friday-WorkingHours-Afternoon-DDos.pcap_ISCX.csv.parquet"
)

# Column names clean
data.columns = data.columns.str.strip()

# Selected network features
features = [
    "Destination Port",
    "Flow Duration",
    "Total Fwd Packets",
    "Total Backward Packets",
    "Total Length of Fwd Packets",
    "Total Length of Bwd Packets",
    "Flow Bytes/s",
    "Flow Packets/s",
    "SYN Flag Count"
]

# Features aur labels select
X = data[features].copy()

labels = data["Label"].astype(str).str.strip()

# BENIGN = Normal, DDoS = Suspicious
y = labels.map({
    "BENIGN": 0,
    "DDoS": 1
})

# Invalid values clean
X = X.replace([np.inf, -np.inf], np.nan)

# Missing records remove
valid_rows = y.notna() & X.notna().all(axis=1)

X = X.loc[valid_rows]
y = y.loc[valid_rows]

# Training aur testing split
X_train, X_test, y_train, y_test = train_test_split(
    X,
    y,
    test_size=0.20,
    random_state=42,
    stratify=y
)

# Random Forest model
model = RandomForestClassifier(
    n_estimators=100,
    random_state=42,
    class_weight="balanced",
    n_jobs=-1
)

# Model training
print("Training real dataset model...")

model.fit(X_train, y_train)

# Predictions
predictions = model.predict(X_test)

# Evaluation
print("\nModel Training Complete!")

print("\nAccuracy:")
print(accuracy_score(y_test, predictions))

print("\nClassification Report:")
print(classification_report(
    y_test,
    predictions,
    target_names=["Normal", "DDoS Attack"]
))

print("\nConfusion Matrix:")
print(confusion_matrix(y_test, predictions))

# Model save
joblib.dump(model, "network_model.pkl")

print("\nReal Dataset Model Saved Successfully!")