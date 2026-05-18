from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field, validator
from typing import Optional, List
import joblib
import numpy as np
from datetime import datetime

app = FastAPI(
    title="Car Health Prediction API",
    description="Advanced predictive maintenance API for vehicle health monitoring",
    version="2.0.0"
)

# Configure CORS for React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:3001",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:3001",
    ],
    allow_credentials=True,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["*"],
)

try:
    model = joblib.load("../saved_models/model.pkl")
    scaler = joblib.load("../saved_models/scaler.pkl")
except Exception as e:
    raise RuntimeError(f"Error loading model/scaler: {e}")


class CarInput(BaseModel):
    air_temperature: float = Field(
        ...,
        gt=250,
        lt=400,
        description="Air temperature in Kelvin (250-400K)"
    )
    process_temperature: float = Field(
        ...,
        gt=250,
        lt=450,
        description="Process temperature in Kelvin (250-450K)"
    )
    rotational_speed: float = Field(
        ...,
        gt=0,
        lt=3000,
        description="Rotational speed in rpm (0-3000)"
    )
    torque: float = Field(
        ...,
        gt=0,
        lt=100,
        description="Torque in Nm (0-100)"
    )
    tool_wear: float = Field(
        ...,
        ge=0,
        lt=300,
        description="Tool wear in minutes (0-300)"
    )
    type_L: int = Field(
        ...,
        ge=0,
        le=1,
        description="Machine type L indicator (0 or 1)"
    )
    type_M: int = Field(
        ...,
        ge=0,
        le=1,
        description="Machine type M indicator (0 or 1)"
    )

    @validator('type_L', 'type_M')
    def validate_type_indicators(cls, v, values):
        """Ensure only one type indicator is set at a time"""
        if 'type_L' in values and 'type_M' in values:
            if values['type_L'] == 1 and v == 1:
                raise ValueError("Only one machine type indicator can be 1 at a time")
        return v

    @validator('process_temperature')
    def validate_temperature_difference(cls, v, values):
        """Ensure process temperature is higher than air temperature"""
        if 'air_temperature' in values:
            if v <= values['air_temperature']:
                raise ValueError("Process temperature must be higher than air temperature")
        return v

    class Config:
        schema_extra = {
            "example": {
                "air_temperature": 298.5,
                "process_temperature": 308.5,
                "rotational_speed": 1500,
                "torque": 40,
                "tool_wear": 15,
                "type_L": 1,
                "type_M": 0
            }
        }


def calculate_risk_level(probability: float) -> str:
    """Calculate risk level based on failure probability"""
    if probability < 0.3:
        return "Low"
    elif probability < 0.7:
        return "Medium"
    else:
        return "High"


def get_maintenance_advice(
    status: str,
    risk_level: str,
    failure_types: List[str],
    input_data: dict
) -> str:
    """Generate detailed maintenance advice based on prediction results"""
    if status == "Healthy":
        if risk_level == "Low":
            return "Machine is healthy. Continue normal operation with routine monitoring."
        elif risk_level == "Medium":
            return "Machine is healthy but showing early warning signs. Increase monitoring frequency and schedule preventive maintenance within 2 weeks."
        else:
            return "Machine is healthy but at high risk. Immediate inspection recommended. Consider scheduling maintenance within 48 hours."
    else:
        # Machine is faulty
        advice_parts = []
        
        if failure_types:
            failure_descriptions = {
                "TWF": "Tool Wear Failure - tool has worn beyond acceptable limits",
                "HDF": "Heat Dissipation Failure - cooling system malfunction detected",
                "PWF": "Power Failure - power supply or electrical issue detected",
                "OSF": "Overstrain Failure - machine operating beyond design specifications",
                "RNF": "Random Failure - unexpected malfunction detected"
            }
            
            for ft in failure_types:
                advice_parts.append(failure_descriptions.get(ft, f"{ft} detected"))
        
        # Add specific advice based on sensor readings
        if input_data['torque'] > 60:
            advice_parts.append("High torque detected - check for mechanical resistance")
        if input_data['rotational_speed'] > 2500:
            advice_parts.append("High rotational speed - verify load specifications")
        if input_data['tool_wear'] > 200:
            advice_parts.append("Tool wear approaching critical levels - replacement needed")
        if input_data['process_temperature'] - input_data['air_temperature'] > 20:
            advice_parts.append("Excessive temperature difference - check cooling system")
        
        # Priority recommendation
        if risk_level == "High":
            advice_parts.insert(0, "CRITICAL: Immediate shutdown and maintenance required!")
        elif risk_level == "Medium":
            advice_parts.insert(0, "URGENT: Maintenance required within 24 hours")
        else:
            advice_parts.insert(0, "Maintenance required within 1 week")
        
        return " | ".join(advice_parts)


@app.get("/")
def home():
    return {
        "message": "Car Health Prediction API is running",
        "version": "2.0.0",
        "endpoints": {
            "/": "API information",
            "/predict": "POST endpoint for predictions",
            "/health": "Health check endpoint"
        }
    }


@app.get("/health")
def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "model_loaded": model is not None,
        "scaler_loaded": scaler is not None
    }


@app.post("/predict")
def predict(data: CarInput):
    """
    Predict machine health status with probability and risk assessment
    
    Returns:
        - status: Healthy or Faulty
        - prediction: Detailed prediction for each failure type
        - probability: Failure probability (0-1)
        - risk_level: Low, Medium, or High
        - failure_types_detected: List of detected failure types
        - maintenance_advice: Detailed maintenance recommendations
        - timestamp: Prediction timestamp
    """
    try:
        # Prepare input data
        input_data = np.array([[
            data.air_temperature,
            data.process_temperature,
            data.rotational_speed,
            data.torque,
            data.tool_wear,
            data.type_L,
            data.type_M
        ]])

        # Scale the input data
        scaled_data = scaler.transform(input_data)

        # Get prediction
        prediction = model.predict(scaled_data)[0]

        # Get probability if model supports it
        try:
            probability = model.predict_proba(scaled_data)[0][1]  # Probability of failure
        except AttributeError:
            # If model doesn't have predict_proba, estimate based on prediction
            probability = 0.9 if prediction[0] == 1 else 0.1

        # Map predictions to target names
        target_names = ["Machine failure", "TWF", "HDF", "PWF", "OSF", "RNF"]
        result = dict(zip(target_names, prediction.astype(int).tolist()))

        # Determine status
        if result["Machine failure"] == 1:
            status = "Faulty"
        else:
            status = "Healthy"

        # Calculate risk level
        risk_level = calculate_risk_level(probability)

        # Identify failure types
        failure_types = [
            name for name in ["TWF", "HDF", "PWF", "OSF", "RNF"]
            if result[name] == 1
        ]

        # Generate maintenance advice
        input_dict = {
            'air_temperature': data.air_temperature,
            'process_temperature': data.process_temperature,
            'rotational_speed': data.rotational_speed,
            'torque': data.torque,
            'tool_wear': data.tool_wear
        }
        advice = get_maintenance_advice(status, risk_level, failure_types, input_dict)

        return {
            "status": status,
            "prediction": result,
            "probability": round(probability, 4),
            "probability_percentage": f"{round(probability * 100, 2)}%",
            "risk_level": risk_level,
            "failure_types_detected": failure_types,
            "maintenance_advice": advice,
            "timestamp": datetime.now().isoformat(),
            "input_data": {
                "air_temperature": data.air_temperature,
                "process_temperature": data.process_temperature,
                "rotational_speed": data.rotational_speed,
                "torque": data.torque,
                "tool_wear": data.tool_wear,
                "machine_type": "L" if data.type_L == 1 else "M" if data.type_M == 1 else "H"
            }
        }

    except ValueError as ve:
        raise HTTPException(status_code=422, detail=f"Validation error: {str(ve)}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction error: {str(e)}")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)