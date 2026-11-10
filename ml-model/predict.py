import sys
import json
import joblib
import pandas as pd

# Trained ML model load karna
model = joblib.load("network_model.pkl")

try:
    # Backend se JSON input lena
    data = json.load(sys.stdin)

    features = pd.DataFrame([{
    "failed_attempts": data["failed_attempts"],
    "requests_per_minute": data["requests_per_minute"],
    "bytes_transferred": data["bytes_transferred"],
    "destination_port": data["destination_port"]
}])

    # ML prediction
    prediction = model.predict(features)[0]

    # Prediction probability
    probabilities = model.predict_proba(features)[0]
    confidence = float(max(probabilities))

    # Backend ko JSON result dena
    result = {
        "prediction": str(prediction),
        "confidence": round(confidence * 100, 2)
    }

    print(json.dumps(result))

except Exception as error:
    print(json.dumps({"error": str(error)}))
    sys.exit(1)