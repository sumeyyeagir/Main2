from flask import Flask, request, jsonify
from flask_cors import CORS
import numpy as np
import pandas as pd
import pickle
import tensorflow as tf
from PIL import Image
import requests
import base64
import os

# Model paths
RF_MODEL_PATH = "/Users/busrainan/Desktop/new3/Main/rf_model.pkl"
SCALER_PATH = "/Users/busrainan/Desktop/new3/Main/scaler.pkl"
CNN_MODEL_PATH = "/Users/busrainan/Desktop/new3/Main/cnn_model.h5"

API_KEY = "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"
API_KEY2 = "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"
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

def get_vlm_analysis(image_path):
    try:
        with open(image_path, "rb") as img_file:
            base64_image = base64.b64encode(img_file.read()).decode("utf-8")

        prompt = [
            {
                "type": "image_url",
                "image_url": {
                    "url": f"data:image/jpeg;base64,{base64_image}",
                },
            },
            {
                "type": "text",
                "text": "Sen bir tıp uzmanısın. Ultrason görüntüsünü analiz et ve detaylı klinik yorumunu yap. Görülebilen herhangi bir anormallik, olası karaciğer fibroz evreleri veya mevcutsa diğer önemli bulguları belirt. Kısa cevap ver. 5 cümlede anlat.",
            },
        ]

        headers = {
            "Authorization": f"Bearer {API_KEY2}",
            "Content-Type": "application/json",
        }

        payload = {
            "model": "mistralai/mistral-small-3.2-24b-instruct:free",
            "messages": [
                {
                    "role": "user",
                    "content": prompt,
                }
            ],
            "max_tokens": 1024,
            "temperature": 0.7,
        }

        print("\nSending VLM request to OpenRouter API...")
        response = requests.post(
            "https://openrouter.ai/api/v1/chat/completions",
            json=payload,
            headers=headers
        )

        if response.status_code == 200:
            vlm_response = response.json()["choices"][0]["message"]["content"]
            return vlm_response
        else:
            return f"VLM response failed (status code {response.status_code})."

    except Exception as e:
        return f"VLM analysis error: {str(e)}"

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
            float(data["AG_Ratio"]),
        ]

        image = request.files.get("image", None)
        if image is None:
            return jsonify({"error": "Ultrasound image is required."}), 400

        image_path = "temp_image.jpg"
        image.save(image_path)
        print(f"\nSaved ultrasound image to: {image_path}")

        # Clinical prediction
        df_input = pd.DataFrame([input_vals], columns=[
            'Total Bilirubin', 'Direct Bilirubin',
            'Alkphos Alkaline Phosphotase', 'Sgpt Alamine Aminotransferase',
            'Sgot Aspartate Aminotransferase', 'Total Protiens',
            'ALB Albumin', 'A/G Ratio Albumin and Globulin Ratio'
        ])
        scaled_input = scaler.transform(df_input)
        clinic_prediction = rf_model.predict(scaled_input)[0]
        print(f"\nClinical prediction (RF model): {clinic_prediction}")

        # CNN prediction
        img = Image.open(image_path).convert("RGB").resize((128, 128))
        img_array = np.expand_dims(np.array(img) / 255.0, axis=0)
        predictions = cnn_model.predict(img_array)
        predicted_class = class_labels[np.argmax(predictions)]
        confidence = float(np.max(predictions) * 100)
        print(f"Image prediction (CNN model): {predicted_class} (Confidence: {confidence:.2f}%)")

        # LLM explanation
        llm_prompt = f"""
Sen tecrübeli bir hepatoloji uzmanı ve karaciğer hastalıkları üzerine çalışan bir yapay zeka destekli klinik danışmansın. Aşağıda bir hastaya ait biyokimya laboratuvar verileri ve yapay zeka tarafından tahmin edilen karaciğer fibroz evresi verilmiştir.

Bu bilgilere dayanarak:
1. Hastanın mevcut karaciğer durumu hakkında detaylı klinik bir değerlendirme yap,
2. Fibroz evresinin anlamını açıklayarak karaciğerdeki yapısal değişiklikleri yorumla,
3. Bulgulara dayalı olası hastalık nedenlerini (etiyoloji) belirt (örneğin viral hepatit, alkole bağlı hasar, NAFLD/NASH vb.),
4. Uygun tedavi önerileri sun,
5. Takip sıklığı, izlenmesi gereken parametreler ve ileri test gerekliliği hakkında tıbbi önerilerde bulun.

### Hastanın Laboratuvar Bulguları:
- Total Bilirubin: {input_vals[0]}
- Direkt Bilirubin: {input_vals[1]}
- ALP (Alkalen Fosfataz): {input_vals[2]}
- ALT (Alanin Aminotransferaz): {input_vals[3]}
- AST (Aspartat Aminotransferaz): {input_vals[4]}
- Total Protein: {input_vals[5]}
- Albümin: {input_vals[6]}
- A/G Oranı (Albumin/Globulin): {input_vals[7]}

### Yapay Zeka Tarafından Tahmin Edilen Fibroz Evresi: {predicted_class}
"""

        headers = {
            "Authorization": f"Bearer {API_KEY}",
            "Content-Type": "application/json"
        }

        llm_payload = {
            "model": "tngtech/deepseek-r1t2-chimera:free",
            "messages": [{"role": "user", "content": llm_prompt}]
        }

        print("\nSending LLM request to OpenRouter API...")
        llm_response = requests.post(
            "https://openrouter.ai/api/v1/chat/completions",
            headers=headers,
            json=llm_payload
        )

        if llm_response.status_code == 200:
            llm_explanation = llm_response.json()["choices"][0]["message"]["content"]
            print("\nLLM Explanation Received")
        else:
            llm_explanation = "LLM response failed."
            print(f"\nLLM request failed with status code: {llm_response.status_code}")

        # VLM Explanation
        vlm_explanation = get_vlm_analysis(image_path)

        # Cleanup
        if os.path.exists(image_path):
            os.remove(image_path)
            print(f"\nRemoved temporary image: {image_path}")

        return jsonify({
            "clinic_result": int(clinic_prediction),
            "image_result": predicted_class,
            "confidence": round(confidence, 2),
            "llm_explanation": llm_explanation,
            "vlm_explanation": vlm_explanation
        })

    except Exception as e:
        print(f"\nError in predict endpoint: {str(e)}")
        return jsonify({"error": str(e)}), 500

@app.route("/chat", methods=["POST"])
def chat():
    try:
        data = request.json
        user_message = data.get("message", "")
        if not user_message:
            return jsonify({"error": "Mesaj boş olamaz."}), 400

        prompt = f"""
You are a hepatology specialist assistant. Answer the patient's question clearly and professionally.

Patient's question: {user_message}
"""

        headers = {
            "Authorization": f"Bearer {API_KEY}",
            "Content-Type": "application/json"
        }

        payload = {
            "model": "tngtech/deepseek-r1t2-chimera:free",
            "messages": [{"role": "user", "content": prompt}]
        }

        llm_response = requests.post(
            "https://openrouter.ai/api/v1/chat/completions",
            headers=headers,
            json=payload
        )

        if llm_response.status_code == 200:
            answer = llm_response.json()["choices"][0]["message"]["content"]
        else:
            return jsonify({"error": "LLM API çağrısı başarısız."}), 500

        return jsonify({"response": answer})

    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    print("Starting Liver Fibrosis Prediction API...")
    app.run(debug=True, port=5001)
