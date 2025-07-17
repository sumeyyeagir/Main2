from flask import Flask, request, jsonify
from flask_cors import CORS
import numpy as np
import pandas as pd
import pickle
import tensorflow as tf
from PIL import Image
import requests

# Model yolları
RF_MODEL_PATH = r"C:\Users\ervae\Downloads\Proje-main\rf_model.pkl"
SCALER_PATH = r"C:\Users\ervae\Downloads\Proje-main\scaler.pkl"
CNN_MODEL_PATH = r"C:\Users\ervae\Downloads\Proje-main\cnn_model.h5"
API_KEY = "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"

class_labels = ['F0', 'F1', 'F2', 'F3', 'F4']

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}}, supports_credentials=True)

with open(SCALER_PATH, "rb") as f:
    scaler = pickle.load(f)
with open(RF_MODEL_PATH, "rb") as f:
    rf_model = pickle.load(f)
cnn_model = tf.keras.models.load_model(CNN_MODEL_PATH)

@app.route("/")
def home():
    return "Liver Fibrosis Prediction API is running!"

@app.route("/predict", methods=["POST"])
def predict():
    try:
        data = request.form
        input_vals = [
            float(data["Total_Bilirubin"]),
            float(data["Direct_Bilirubin"]),
            float(data["ALP"]),
            float(data["ALT"]),
            float(data["AST"]),
            float(data["Proteins"]),
            float(data["Albumin"]),
            float(data["AG_Ratio"])
        ]

        image = request.files["image"]
        image_path = "temp_image.jpg"
        image.save(image_path)

        df_input = pd.DataFrame([input_vals], columns=[
            'Total Bilirubin', 'Direct Bilirubin',
            'Alkphos Alkaline Phosphotase', 'Sgpt Alamine Aminotransferase',
            'Sgot Aspartate Aminotransferase', 'Total Protiens',
            'ALB Albumin', 'A/G Ratio Albumin and Globulin Ratio'
        ])
        scaled_input = scaler.transform(df_input)
        clinic_prediction = rf_model.predict(scaled_input)[0]

        img = Image.open(image_path).convert("RGB").resize((128, 128))
        img_array = np.expand_dims(np.array(img) / 255.0, axis=0)
        predictions = cnn_model.predict(img_array)
        predicted_class = class_labels[np.argmax(predictions)]
        confidence = float(np.max(predictions) * 100)

        prompt = f"""
        You are a hepatology specialist. Based on the patient's blood biochemistry results and the predicted liver fibrosis stage, generate a medical report.

        Patient's Lab Results:
        - Total Bilirubin: {input_vals[0]}
        - Direct Bilirubin: {input_vals[1]}
        - ALP: {input_vals[2]}
        - ALT: {input_vals[3]}
        - AST: {input_vals[4]}
        - Proteins: {input_vals[5]}
        - Albumin: {input_vals[6]}
        - A/G Ratio: {input_vals[7]}

        Predicted Fibrosis Stage: {predicted_class}

        Write a clinical interpretation, possible etiology, recommendations, and follow-up.
        """

        headers = {
            "Authorization": f"Bearer {API_KEY}",
            "Content-Type": "application/json"
        }

        payload = {
            "model": "mistralai/mistral-7b-instruct",
            "messages": [{"role": "user", "content": prompt}]
        }

        llm_response = requests.post("https://openrouter.ai/api/v1/chat/completions",
                                     headers=headers, json=payload)

        if llm_response.status_code == 200:
            explanation = llm_response.json()["choices"][0]["message"]["content"]
        else:
            explanation = "LLM response failed."

        return jsonify({
            "clinic_result": int(clinic_prediction),
            "image_result": predicted_class,
            "confidence": round(confidence, 2),
            "llm_explanation": explanation
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(debug=True, port=5001)
