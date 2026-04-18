import sys
import json
import os
import pandas as pd
import numpy as np
import tensorflow as tf


# ==========================================
# CUSTOM LAYER & LOSS
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

    def call(self, inputs):
        mean = tf.reduce_mean(inputs, axis=0, keepdims=True)
        std = tf.math.reduce_std(inputs, axis=0, keepdims=True) + 1e-8
        return (inputs - mean) / std * self.scale + self.offset

    def get_config(self):
        return super(FeatureNormalizationLayer, self).get_config()


@tf.keras.utils.register_keras_serializable(package="Custom")
class DietCalorieLoss(tf.keras.losses.Loss):
    def __init__(self, name="diet_calorie_loss", **kwargs):
        super().__init__(name=name, **kwargs)

    def call(self, y_true, y_pred):
        error = y_true - y_pred
        return tf.reduce_mean(tf.square(error))

    def get_config(self):
        return super().get_config()


def clean_text(text):
    return str(text).replace(".", "").strip().lower()


def main():
    try:
        # Parsing Args
        age, weight, height = float(sys.argv[1]), float(sys.argv[2]), float(sys.argv[3])
        purpose_str, target_cal = sys.argv[4].lower(), float(sys.argv[5])
        liked_str, disliked_str, allergic_str = sys.argv[6], sys.argv[7], sys.argv[8]

        purpose_code = {
            "lose weight": 0.0,
            "gain muscle": 1.0,
            "stability weight": 0.5,
        }.get(purpose_str, 0.5)

        # Load Model & Data
        model_path = os.path.join(os.path.dirname(__file__), "diet_drl_model.keras")
        model = tf.keras.models.load_model(model_path)
        df = pd.read_csv(os.path.join(os.path.dirname(__file__), "nutrition.csv"))

        liked = (
            [clean_text(x) for x in liked_str.split(",")]
            if liked_str.lower() != "none"
            else []
        )
        banned = (
            [clean_text(x) for x in (disliked_str + "," + allergic_str).split(",")]
            if (disliked_str + allergic_str).lower() != "none"
            else []
        )

        # Inference
        state = np.array(
            [age, weight, height, target_cal, purpose_code, 0, 1.0], dtype="float32"
        ).reshape(1, -1)
        q_values = model.predict(state, verbose=0)[0]

        results = []
        for idx in range(len(df)):
            name = clean_text(df.iloc[idx]["name"])
            if any(b in name for b in banned if b):
                continue

            score = float(q_values[idx])
            if any(l in name for l in liked if l):
                score += 50.0

            results.append(
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

        results.sort(key=lambda x: x["score"], reverse=True)
        print(json.dumps(results[:25]))  # Kembalikan Top 25

    except Exception as e:
        print(json.dumps([{"food": f"Error: {str(e)}", "calories": 0}]))


if __name__ == "__main__":
    main()
