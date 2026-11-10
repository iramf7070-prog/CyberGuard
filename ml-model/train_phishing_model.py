
import pandas as pd
import joblib

from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import (
    accuracy_score,
    classification_report,
    confusion_matrix
)

# Dataset load
data = pd.read_csv("url_features_extracted1.csv")

# Missing labels remove
data = data.dropna(subset=["ClassLabel"])

# Duplicate records remove
before = len(data)
data = data.drop_duplicates()
print("Duplicate records removed:", before - len(data))

# 16 numerical features
feature_columns = [
    "url_length",
    "has_ip_address",
    "dot_count",
    "https_flag",
    "url_entropy",
    "token_count",
    "subdomain_count",
    "query_param_count",
    "tld_length",
    "path_length",
    "has_hyphen_in_domain",
    "number_of_digits",
    "tld_popularity",
    "suspicious_file_extension",
    "domain_name_length",
    "percentage_numeric_chars"
]

# Features and labels
X = data[feature_columns]
y = data["ClassLabel"].astype(int)

# Missing feature values check
X = X.apply(pd.to_numeric, errors="coerce")
valid_rows = X.notna().all(axis=1)
X = X[valid_rows]
y = y[valid_rows]

print("\nClass distribution:")
print(y.value_counts())

# Training and testing split
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

print("\nTraining Phishing ML Model...")

model.fit(X_train, y_train)

# Predictions
predictions = model.predict(X_test)

print("\nTraining Complete!")
print("\nAccuracy:")
print(accuracy_score(y_test, predictions))

print("\nClassification Report:")
print(classification_report(
    y_test,
    predictions,
    labels=[0, 1],
    target_names=["Phishing (Class 0)", "Legitimate (Class 1)"]
))

print("\nConfusion Matrix:")
print(confusion_matrix(y_test, predictions, labels=[0, 1]))

# Save model
joblib.dump(model, "phishing_model.pkl")

print("\nPhishing ML Model Saved Successfully!")
