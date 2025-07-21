from flask import Flask, request, jsonify
from flask_cors import CORS
import numpy as np
import pandas as pd
import pickle
import tensorflow as tf
from PIL import Image
import requests

# Model yolları
RF_MODEL_PATH = "/Users/busrainan/Desktop/new3/Main/rf_model.pkl"
SCALER_PATH = "/Users/busrainan/Desktop/new3/Main/scaler.pkl"
CNN_MODEL_PATH = "/Users/busrainan/Desktop/new3/Main/cnn_model.h5"
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

        image = request.files.get("image", None)
        if image is None:
            return jsonify({"error": "Ultrasound image is required."}), 400

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
    Siz bir hepatoloji uzmanısınız. Hastanın kan biyokimya sonuçları ve tahmin edilen karaciğer fibrozis evresine göre tıbbi bir rapor oluşturun.

    Hastanın Laboratuvar Sonuçları:
    - Total Bilirubin: {input_vals[0]}
    - Direkt Bilirubin: {input_vals[1]}
    - ALP: {input_vals[2]}
    - ALT: {input_vals[3]}
    - AST: {input_vals[4]}
    - Proteinler: {input_vals[5]}
    - Albümin: {input_vals[6]}
    - A/G Oranı: {input_vals[7]}

    Tahmin Edilen Fibrozis Evresi: {predicted_class}

    Klinik bir yorum, olası etiyoloji (neden), öneriler ve takip planı yazınız.
"""


        headers = {
            "Authorization": f"Bearer {API_KEY}",
            "Content-Type": "application/json"
        }

        payload = {
            "model": "tngtech/deepseek-r1t2-chimera:free",
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

@app.route("/chat", methods=["POST"])
def chat():
    try:
        data = request.json
        user_message = data.get("message", "")
        if not user_message:
            return jsonify({"error": "Mesaj boş olamaz."}), 400

        prompt = f"""
    Siz bir hepatoloji uzmanı asistanısınız. Hastanın sorusuna açık ve profesyonel bir şekilde yanıt verin.

    Hastanın sorusu: {user_message}
"""


        headers = {
            "Authorization": f"Bearer {API_KEY}",
            "Content-Type": "application/json"
        }

        payload = {
            "model": "tngtech/deepseek-r1t2-chimera:free",
            "messages": [{"role": "user", "content": prompt}]
        }

        llm_response = requests.post("https://openrouter.ai/api/v1/chat/completions",
                                     headers=headers, json=payload)

        if llm_response.status_code == 200:
            answer = llm_response.json()["choices"][0]["message"]["content"]
        else:
            return jsonify({"error": "LLM API çağrısı başarısız."}), 500

        return jsonify({"response": answer})

    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(debug=True, port=5001)
