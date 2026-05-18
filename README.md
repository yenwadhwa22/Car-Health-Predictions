# 🚗 Car Health Prediction System using Machine Learning

## 📌 Project Overview

The **Car Health Prediction System** is a Machine Learning-based application that predicts whether a car (or machine) is in a healthy condition or likely to fail. The system uses historical sensor data such as temperature, speed, torque, and tool wear to make predictions.

This project demonstrates the complete ML lifecycle, including data preprocessing, model training, evaluation, and deployment using a modern tech stack.

---

## 🎯 Objectives

* Predict machine/car failure using ML models
* Perform data preprocessing and feature engineering
* Handle imbalanced datasets
* Build and compare multiple ML models
* Deploy the model using FastAPI backend
* Create an interactive UI using React

---

## 🧠 Machine Learning Approach

This project is based on **Supervised Learning (Classification)**:

* Input: Sensor data (temperature, RPM, torque, etc.)
* Output:

  * `0` → Healthy
  * `1` → Failure

---

## 📊 Dataset Information

* Total Records: 10,000

* Features:

  * Type (L, M, H)
  * Air Temperature [K]
  * Process Temperature [K]
  * Rotational Speed [RPM]
  * Torque [Nm]
  * Tool Wear [min]

* Target:

  * Machine Failure (0 or 1)

### ⚠️ Data Cleaning Notes

* Dropped irrelevant columns: `UDI`, `Product ID`
* Removed data leakage columns: `TWF`, `HDF`, `PWF`, `OSF`, `RNF`

---

## 🛠️ Tech Stack

### 🔹 Frontend

* React.js
* Axios (API calls)

### 🔹 Backend

* FastAPI
* Uvicorn

### 🔹 Machine Learning

* Python
* Pandas, NumPy
* Scikit-learn
* Matplotlib / Seaborn

---

## ⚙️ Project Workflow

### 1. Data Preprocessing

* Handling missing values
* Encoding categorical variables
* Feature scaling

### 2. Exploratory Data Analysis (EDA)

* Distribution analysis
* Correlation matrix
* Visualization

### 3. Model Training

* Logistic Regression
* K-Nearest Neighbors (KNN)
* Decision Tree
* Random Forest

### 4. Model Evaluation

* Confusion Matrix
* Precision, Recall, F1-score
* Cross-validation

### 5. Handling Imbalanced Data

* Oversampling (SMOTE)
* Class weighting

### 6. Model Deployment

* Save model using `pickle`
* Create API using FastAPI
* Connect frontend (React) with backend

---

## 📁 Project Structure

```
car-health-prediction/
│
├── dataset/
│   └── ai4i2020.csv
│
├── models/
│   ├── preprocessing.py
│   ├── train_model.py
│   └── model.pkl
│
├── backend/
│   ├── main.py
│   └── utils.py
│
├── frontend/
│   ├── src/
│   └── public/
│
├── notebooks/
│   └── eda.ipynb
│
├── requirements.txt
└── README.md
```

---

## 🚀 How to Run the Project

### 1. Clone Repository

```
git clone <your-repo-link>
cd car-health-prediction
```

### 2. Install Dependencies

```
pip install -r requirements.txt
```

### 3. Run Backend

```
cd backend
uvicorn main:app --reload
```

### 4. Run Frontend

```
cd frontend
npm install
npm start
```

---

## 📈 Future Improvements

* Add real-time sensor integration
* Use deep learning models
* Deploy on cloud (AWS / Render / Vercel)
* Add user authentication

---

## 👨‍💻 Author

* Your Name

---

## 📜 License

This project is for educational purposes.
