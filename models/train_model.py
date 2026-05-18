# ============================================================
# Car Health Prediction - Multi Output Balanced Model
# Predicts: Machine failure, TWF, HDF, PWF, OSF, RNF
# ============================================================

import os
import joblib
import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns

from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.multioutput import MultiOutputClassifier
from sklearn.metrics import accuracy_score, confusion_matrix, classification_report

from imblearn.ensemble import BalancedRandomForestClassifier


DATASET_PATH = "../dataset/ai4i2020.csv"
MODEL_PATH = "../saved_models/model.pkl"
SCALER_PATH = "../saved_models/scaler.pkl"

TARGET_COLUMNS = [
    "Machine failure",
    "TWF",
    "HDF",
    "PWF",
    "OSF",
    "RNF"
]


# ============================================================
# Load Dataset
# ============================================================

df = pd.read_csv(DATASET_PATH)

print("Dataset loaded successfully!")
print("Dataset Shape:", df.shape)
print("Columns:", df.columns.tolist())


# ============================================================
# Basic EDA
# ============================================================

print("\nMachine Failure Distribution:")
print(df["Machine failure"].value_counts())

print("\nFailure Types Distribution:")
for col in ["TWF", "HDF", "PWF", "OSF", "RNF"]:
    print(f"{col}: {df[col].sum()} cases")


# ============================================================
# Optional EDA Graphs
# ============================================================

sns.countplot(x="Machine failure", data=df)
plt.title("Machine Failure Distribution")
plt.show()

plt.figure(figsize=(10, 6))
sns.heatmap(df.corr(numeric_only=True), annot=True, fmt=".2f", cmap="coolwarm")
plt.title("Correlation Heatmap")
plt.show()

sns.boxplot(x="Machine failure", y="Torque [Nm]", data=df)
plt.title("Torque vs Machine Failure")
plt.show()


# ============================================================
# Preprocessing
# ============================================================

# Remove only useless columns
df = df.drop(columns=["UDI", "Product ID"])

# One-hot encode Type
df = pd.get_dummies(df, columns=["Type"], drop_first=True)

# X = input features
X = df.drop(columns=TARGET_COLUMNS)

# y = multiple targets
y = df[TARGET_COLUMNS]

print("\nInput Features:")
print(X.columns.tolist())

print("\nTarget Columns:")
print(y.columns.tolist())


# ============================================================
# Train-Test Split
# ============================================================

X_train, X_test, y_train, y_test = train_test_split(
    X,y,test_size=0.2,random_state=42
)


# ============================================================
# Scaling
# ============================================================

scaler = StandardScaler()

X_train_scaled = scaler.fit_transform(X_train)
X_test_scaled = scaler.transform(X_test)


# ============================================================
# Multi-Output Balanced Random Forest
# ============================================================

base_model = BalancedRandomForestClassifier(
    n_estimators=400,
    max_depth=15,
    min_samples_split=5,
    random_state=42
)

model = MultiOutputClassifier(base_model)

print("\nTraining Multi-Output Balanced Random Forest...")
model.fit(X_train_scaled, y_train)

print("Training completed!")


# ============================================================
# Prediction
# ============================================================

y_pred = model.predict(X_test_scaled)


# ============================================================
# Evaluation for Each Target
# ============================================================

for i, target in enumerate(TARGET_COLUMNS):
    print("\n====================================")
    print(f"TARGET: {target}")
    print("====================================")

    acc = accuracy_score(y_test.iloc[:, i], y_pred[:, i])

    print(f"\nAccuracy: {acc * 100:.2f}%")

    print("\nConfusion Matrix:")
    print(confusion_matrix(y_test.iloc[:, i], y_pred[:, i]))

    print("\nClassification Report:")
    print(
        classification_report(
            y_test.iloc[:, i],
            y_pred[:, i],
            zero_division=0
        )
    )


# ============================================================
# Feature Importance for Machine Failure
# ============================================================

machine_failure_model = model.estimators_[0]
feature_importance = machine_failure_model.feature_importances_

plt.figure(figsize=(10, 6))
plt.barh(X.columns, feature_importance)
plt.xlabel("Importance")
plt.ylabel("Features")
plt.title("Feature Importance - Machine Failure")
plt.tight_layout()
plt.show()


# ============================================================
# Save Model and Scaler
# ============================================================

os.makedirs("../saved_models", exist_ok=True)

joblib.dump(model, MODEL_PATH)
joblib.dump(scaler, SCALER_PATH)

print("\nModel and scaler saved successfully!")
print("Model saved at:", MODEL_PATH)
print("Scaler saved at:", SCALER_PATH)