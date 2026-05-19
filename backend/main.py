from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

import joblib
import numpy as np


app = FastAPI(
    title="Car Health Prediction API",
    description="Multi-output car/machine failure prediction using ML",
    version="2.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


TARGET_NAMES = [
    "Machine failure",
    "TWF",
    "HDF",
    "PWF",
    "OSF",
    "RNF"
]

FEATURE_NAMES = [
    "Air temperature [K]",
    "Process temperature [K]",
    "Rotational speed [rpm]",
    "Torque [Nm]",
    "Tool wear [min]",
    "Type_L",
    "Type_M"
]

FAILURE_ADVICE = {
    "TWF": "Tool Wear Failure risk detected. Inspect or replace the worn tool.",
    "HDF": "Heat Dissipation Failure risk detected. Check cooling system and temperature levels.",
    "PWF": "Power Failure risk detected. Check torque, RPM, and power load.",
    "OSF": "Overstrain Failure risk detected. Reduce load and inspect mechanical stress.",
    "RNF": "Random Failure risk detected. Perform manual inspection."
}


try:
    model = joblib.load("../saved_models/model.pkl")
    scaler = joblib.load("../saved_models/scaler.pkl")
except Exception as e:
    raise RuntimeError(f"Error loading model/scaler: {e}")


class CarInput(BaseModel):
    air_temperature: float = Field(..., gt=250, lt=400)
    process_temperature: float = Field(..., gt=250, lt=450)
    rotational_speed: float = Field(..., gt=0)
    torque: float = Field(..., gt=0)
    tool_wear: float = Field(..., ge=0)
    type_L: int = Field(..., ge=0, le=1)
    type_M: int = Field(..., ge=0, le=1)


@app.get("/")
def home():
    return {
        "message": "Car Health Prediction API is running",
        "version": "2.0"
    }


@app.get("/health")
def health_check():
    return {
        "api_status": "healthy",
        "model_loaded": model is not None,
        "scaler_loaded": scaler is not None
    }


@app.get("/model-info")
def model_info():
    return {
        "model": "MultiOutput Balanced Random Forest",
        "targets": TARGET_NAMES,
        "features": FEATURE_NAMES,
        "output": {
            "0": "No failure",
            "1": "Failure detected"
        }
    }


@app.post("/predict")
def predict(data: CarInput):
    try:
        input_data = np.array([[
            data.air_temperature,
            data.process_temperature,
            data.rotational_speed,
            data.torque,
            data.tool_wear,
            data.type_L,
            data.type_M
        ]])

        scaled_data = scaler.transform(input_data)

        prediction = model.predict(scaled_data)[0]
        prediction_result = dict(zip(TARGET_NAMES, prediction.astype(int).tolist()))

        probabilities = {}

        for target_name, estimator in zip(TARGET_NAMES, model.estimators_):
            try:
                prob = estimator.predict_proba(scaled_data)[0][1]
                probabilities[target_name] = round(float(prob) * 100, 2)
            except Exception:
                probabilities[target_name] = None

        machine_failure_probability = probabilities["Machine failure"]

        if machine_failure_probability >= 70:
            risk_level = "High"
        elif machine_failure_probability >= 40:
            risk_level = "Medium"
        else:
            risk_level = "Low"

        if prediction_result["Machine failure"] == 1:
            overall_status = "FAULT DETECTED"
        else:
            overall_status = "HEALTHY"

        detected_failure_types = [
            failure_type
            for failure_type in ["TWF", "HDF", "PWF", "OSF", "RNF"]
            if prediction_result[failure_type] == 1
        ]

        if detected_failure_types:
            advice_list = [
                FAILURE_ADVICE[failure_type]
                for failure_type in detected_failure_types
            ]
        else:
            advice_list = [
                "Machine is currently healthy. Continue regular monitoring."
            ]

        return {
            "overall_status": overall_status,
            "risk_level": risk_level,
            "predictions": prediction_result,
            "probabilities": probabilities,
            "detected_failure_types": detected_failure_types,
            "maintenance_advice": advice_list
        }

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Prediction error: {str(e)}"
        )


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(
        "main:app",
        host="127.0.0.1",
        port=8000,
        reload=True
    )