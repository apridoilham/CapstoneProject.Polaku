from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import tensorflow as tf
import pandas as pd
import numpy as np
import os
import random
from typing import List


# ==========================================
# CUSTOM LAYER & LOSS (Wajib untuk Load Model)
# ==========================================
@tf.keras.utils.register_keras_serializable(package="Custom")
class FeatureNormalizationLayer(tf.keras.layers.Layer):
    def __init__(self, **kwargs):
        super(FeatureNormalizationLayer, self).__init__(**kwargs)

    def build(self, input_shape):
        self.scale = self.add_weight(
            name="scale", shape=(input_shape[-1],), initializer="ones", trainable=True
        )
        self.offset = self.add_weight(
            name="offset", shape=(input_shape[-1],), initializer="zeros", trainable=True
        )
        super(FeatureNormalizationLayer, self).build(input_shape)

    def call(self, inputs):
        mean = tf.reduce_mean(inputs, axis=0, keepdims=True)
        std = tf.math.reduce_std(inputs, axis=0, keepdims=True) + 1e-8
        normalized = (inputs - mean) / std
        return normalized * self.scale + self.offset

    def get_config(self):
        return super(FeatureNormalizationLayer, self).get_config()


@tf.keras.utils.register_keras_serializable(package="Custom")
class DietCalorieLoss(tf.keras.losses.Loss):
    def __init__(self, name="diet_calorie_loss", **kwargs):
        super().__init__(name=name, **kwargs)

    def call(self, y_true, y_pred):
        delta = 1.0
        error = y_true - y_pred
        abs_error = tf.abs(error)
        quadratic = tf.minimum(abs_error, delta)
        linear = tf.subtract(abs_error, quadratic)
        huber_loss = 0.5 * tf.square(quadratic) + delta * linear
        large_error_penalty = tf.where(
            abs_error > 100, tf.square(abs_error - 100) * 0.01, 0.0
        )
        return huber_loss + large_error_penalty

    def get_config(self):
        return super().get_config()


# ==========================================
# FASTAPI APP
# ==========================================
app = FastAPI(title="Polaku AI Inference API", version="1.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

model = None
df = None


@app.on_event("startup")
async def load_model_and_data():
    global model, df
    try:
        base_dir = os.path.dirname(__file__)
        model_path = os.path.join(base_dir, "diet_drl_model.keras")
        model = tf.keras.models.load_model(model_path)
        df = pd.read_csv(os.path.join(base_dir, "nutrition.csv"))
        print("✅ [FastAPI] AI Model & Dataset Loaded! (Mode: Multi-Recommendation)")
    except Exception as e:
        print(f"❌ [FastAPI] Error: {e}")


class InputData(BaseModel):
    age: float
    weight: float
    height: float
    purpose: str
    target_calories: float
    liked_foods: str = ""
    disliked_foods: str = ""
    allergies: str = ""


class FoodOutput(BaseModel):
    food: str
    calories: float
    protein: float
    fat: float
    carbs: float
    image: str
    score: float


def clean(text):
    return str(text).replace(".", "").strip().lower()


# --- FITUR SAPAAN DIKEMBALIKAN AGAR TIDAK ERROR 404 ---
@app.get("/")
def read_root():
    return {"message": "Polaku AI API is running perfectly!", "status": "OK"}


@app.get("/health")
def health_check():
    return {"status": "healthy", "model_loaded": model is not None}


# ------------------------------------------------------


@app.post("/predict", response_model=List[FoodOutput])
def predict(data: InputData):
    if model is None or df is None:
        raise HTTPException(status_code=500, detail="Model belum siap.")

    try:
        purpose_code = {
            "lose weight": 0.0,
            "gain muscle": 1.0,
            "stability weight": 0.5,
        }.get(data.purpose, 0.5)
        liked = (
            [clean(x) for x in data.liked_foods.split(",")] if data.liked_foods else []
        )
        banned = (
            [clean(x) for x in (data.disliked_foods + "," + data.allergies).split(",")]
            if (data.disliked_foods + data.allergies)
            else []
        )

        # 1. State Input untuk Model AI
        state = np.array(
            [
                data.age,
                data.weight,
                data.height,
                data.target_calories,
                purpose_code,
                0,
                1.0,
            ],
            dtype="float32",
        ).reshape(1, -1)

        # 2. Ambil Q-Values (Skor Kecocokan) dari AI untuk semua 900+ makanan
        q_values = model.predict(state, verbose=0)[0]

        recommendations = []
        for idx in range(len(df)):
            food_name = clean(df.iloc[idx]["name"])

            # Filter makanan terlarang
            if any(b in food_name for b in banned if b):
                continue

            # Base score dari model Deep Learning
            score = float(q_values[idx])

            # Bonus score jika makanan disukai user
            if any(l in food_name for l in liked if l):
                score += 50.0

            recommendations.append(
                {
                    "food": df.iloc[idx]["name"],
                    "calories": float(df.iloc[idx]["calories"]),
                    "protein": float(df.iloc[idx]["proteins"]),
                    "fat": float(df.iloc[idx]["fat"]),
                    "carbs": float(df.iloc[idx]["carbohydrate"]),
                    "image": df.iloc[idx]["image"],
                    "score": score,
                }
            )

        # 3. Urutkan berdasarkan skor tertinggi
        recommendations.sort(key=lambda x: x["score"], reverse=True)

        # Berikan Top 25 sebagai pilihan katalog buat user
        return recommendations[:25]

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error: {str(e)}")


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8000)
