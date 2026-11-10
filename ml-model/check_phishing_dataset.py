import pandas as pd

# Phishing dataset load
data = pd.read_csv("url_features_extracted1.csv")

print("Phishing Dataset Loaded Successfully!")

print("\nDataset Shape:")
print(data.shape)

print("\nColumn Names:")
print(data.columns.tolist())

print("\nFirst 5 Rows:")
print(data.head())

print("\nDataset Information:")
data.info()

print("\nLabel Distribution:")
print(data.iloc[:, -1].value_counts())