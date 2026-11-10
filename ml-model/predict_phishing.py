
import sys
import json
import joblib
import pandas as pd

from extract_url_features import extract_features

model = joblib.load("phishing_model.pkl")

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

try:
    data = json.load(sys.stdin)
    url = data["url"]

    features = extract_features(url)

    input_data = pd.DataFrame(
        [[features[column] for column in feature_columns]],
        columns=feature_columns
    )

    prediction = int(model.predict(input_data)[0])
    probabilities = model.predict_proba(input_data)[0]

    result = {
        "prediction": "Phishing" if prediction == 0 else "Legitimate",
        "confidence": round(float(max(probabilities)) * 100, 2)
    }

    print(json.dumps(result))

except Exception as error:
    print(json.dumps({"error": str(error)}))
