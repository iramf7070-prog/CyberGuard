import pandas as pd

file_path = "Friday-WorkingHours-Afternoon-DDos.pcap_ISCX.csv.parquet"

data = pd.read_parquet(file_path)

print("Dataset Loaded Successfully!")
print("Dataset Shape:", data.shape)

print("\nColumn Names:")
print(data.columns.tolist())

print("\nFirst 5 Rows:")
print(data.head())
import numpy as np

print("\nLabel Distribution:")
print(data["Label"].astype(str).str.strip().value_counts())

print("\nMissing Values:")
print(data.isnull().sum().sum())

numeric_data = data.select_dtypes(include="number")

print("\nInfinite Values:")
print(np.isinf(numeric_data.to_numpy()).sum())