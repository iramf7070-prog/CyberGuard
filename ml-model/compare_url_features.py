import pandas as pd
from extract_url_features import extract_features

# Dataset load karo
data = pd.read_csv("url_features_extracted1.csv")

# Pehle 10 URLs select karo
sample = data.head(10)

for index, row in sample.iterrows():
    url = row["URL"]

    print("\n" + "=" * 70)
    print("URL:", url)

    # Dataset ke actual features
    actual = row

    # Hamare extractor ke features
    extracted = extract_features(url)

    print("\nFeature Comparison:")
    print(f"{'Feature':35} {'Dataset':15} {'Extractor':15}")

    for feature in extracted:
        print(
            f"{feature:35} "
            f"{str(actual[feature]):15} "
            f"{str(round(extracted[feature], 4)):15}"
        )