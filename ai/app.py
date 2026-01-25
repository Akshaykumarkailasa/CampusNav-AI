from fastapi import FastAPI
import joblib
from datetime import datetime

app = FastAPI()

# Load trained model
model = joblib.load("crowd_model.pkl")

@app.get("/predict")
def predict_crowd():
    hour = datetime.now().hour
    prediction = model.predict([[hour]])[0]

    if prediction > 70:
        level = "HIGH"
    elif prediction > 40:
        level = "MEDIUM"
    else:
        level = "LOW"

    return {
        "current_hour": hour,
        "predicted_route_count": int(prediction),
        "crowd_level": level
    }
