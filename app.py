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
import pdfplumber
import sqlite3
import json
# Model paths
RF_MODEL_PATH = "/Users/busrainan/Desktop/New 7/Main/rf_model.pkl"
SCALER_PATH = "/Users/busrainan/Desktop/New 7/Main/scaler.pkl"
CNN_MODEL_PATH = "/Users/busrainan/Desktop/New 7/Main/cnn_model.h5"

API_KEY = "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"
API_KEY2 = "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"

class_labels = ['F0', 'F1', 'F2', 'F3', 'F4']

app = Flask(__name__)
UPLOAD_FOLDER = "raporlar"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
CORS(app, resources={r"/*": {"origins": "*"}}, supports_credentials=True)

with open(SCALER_PATH, "rb") as f:
    scaler = pickle.load(f)
with open(RF_MODEL_PATH, "rb") as f:
    rf_model = pickle.load(f)
cnn_model = tf.keras.models.load_model(CNN_MODEL_PATH)

DB_PATH = "users.db"

# Veritabanı başlatma
def init_db():
    if not os.path.exists(DB_PATH):
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()

        # users tablosu (login için)
        cursor.execute("""
            CREATE TABLE users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                username TEXT UNIQUE NOT NULL,
                password TEXT NOT NULL
            )
        """)

        # patients tablosu (hasta bilgileri)
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS patients (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                tc TEXT UNIQUE NOT NULL,
                name TEXT,
                surname TEXT,
                age INTEGER,
                gender TEXT,
                evre TEXT       
            )
        """)

        # reports tablosu: patient_id yerine tc_no tutulacak
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS reports (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                tc_no TEXT NOT NULL,
                report_name TEXT,
                prediction_result TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)

        # Örnek kullanıcılar (login için)
        sample_users = [
            ("erva.ergul", "123456"),
            ("busra.inan", "123456"),
            ("ege.kuzu", "123456"),
            ("kevser.semiz", "123456"),
            ("helin.ozalkan", "123456"),
            ("sumeyye.agir", "123456"),
            ("efe.kesler", "123456"),
            ("devran.sahin", "123456"),
            ("cengizhan.karaman", "123456"),
            ("enes.coban", "123456"),
            ("kerem.guney", "123456"),
        ]
        cursor.executemany("INSERT INTO users (username, password) VALUES (?, ?)", sample_users)

        conn.commit()
        conn.close()
        print("SQLite veritabanı ve kullanıcılar oluşturuldu.")

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

@app.route("/add_report", methods=["POST"])
def add_report():
    try:
        data = request.get_json()
        tc_no = data.get("tc_no")
        report_text = data.get("report_text")
        name = data.get("name")
        surname = data.get("surname")
        age = data.get("age")
        gender = data.get("gender")
        evre = data.get("evre") 

        if not tc_no or not report_text:
            return jsonify({"success": False, "message": "Eksik parametre."}), 400

        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()

        # Eğer hasta daha önce yoksa yeni hasta olarak ekle
        cursor.execute("SELECT id FROM patients WHERE tc = ?", (tc_no,))
        patient = cursor.fetchone()
        if not patient:
            cursor.execute(
                "INSERT INTO patients (tc, name, surname, age, gender, evre) VALUES (?, ?, ?, ?, ?, ?)",
                (tc_no, name, surname, age, gender, evre)
            )
        else:
            # Eğer varsa evre bilgisini güncelle (en güncel tahminle)
            cursor.execute(
                "UPDATE patients SET evre = ? WHERE tc = ?",
                (evre, tc_no)
            )

        # Aynı rapor zaten var mı kontrol et
        cursor.execute("""
            SELECT 1 FROM reports
            WHERE tc_no = ? AND report_name = ? AND prediction_result = ?
        """, (tc_no, "Otomatik Rapor", report_text))
        exists = cursor.fetchone()

        if exists:
            conn.commit()
            conn.close()
            return jsonify({"success": False, "message": "Aynı rapor zaten mevcut."}), 409

        # Raporu ekle
        cursor.execute(
            "INSERT INTO reports (tc_no, report_name, prediction_result) VALUES (?, ?, ?)",
            (tc_no, "Otomatik Rapor", report_text)
        )

        conn.commit()
        conn.close()

        return jsonify({"success": True, "message": "Rapor kaydedildi."})

    except Exception as e:
        return jsonify({"success": False, "message": str(e)}), 500
"""
def export_patients_to_js():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute("SELECT name, tc, evre FROM patients")
    patients = cursor.fetchall()
    conn.close()

    data = [{"ad": name, "tc": tc, "evre": evre} for (name, tc, evre) in patients]

    with open("/Users/cengizhankaraman/Desktop/Son Güncel Proje/Main/src/pages/hastalar.js", "w", encoding="utf-8") as f:
        f.write("const hastalar = ")
        f.write(json.dumps(data, ensure_ascii=False, indent=2))
        f.write(";\n\nexport default hastalar;")

export_patients_to_js()
"""


@app.route("/get_reports/<tc_no>", methods=["GET"])
def get_reports(tc_no):
    try:
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()

        cursor.execute("SELECT report_name, prediction_result, created_at FROM reports WHERE tc_no = ?", (tc_no,))
        reports = cursor.fetchall()
        conn.close()

        report_list = [
            {
                "report_name": r[0],
                "prediction_result": r[1],
                "created_at": r[2]
            }
            for r in reports
        ]

        return jsonify({"tc_no": tc_no, "reports": report_list})

    except Exception as e:
        return jsonify({"success": False, "message": str(e)}), 500


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
Sen tecrübeli bir hepatoloji uzmanı ve karaciğer hastalıkları üzerine çalışan bir yapay zeka destekli klinik danışmansın. Aşağıda bir hastaya ait biyokimya laboratuvar verileri ve yapay zeka tarafından tahmin edilen karaciğer fibroz evreleri verilmiştir.

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
@app.route("/patients", methods=["GET"])
def get_patients():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    cursor.execute("SELECT name, tc, evre FROM patients")
    rows = cursor.fetchall()
    conn.close()

    # Verileri dict formatına çevir
    patients = [{"ad": row[0], "tc": row[1], "evre": row[2]} for row in rows]
    return jsonify(patients)

import sqlite3
import json






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

@app.route("/parse", methods=["POST"])
def parse_pdf():
    try:
        file = request.files.get("file")
        if not file:
            return jsonify({"error": "PDF dosyası yüklenmedi."}), 400

        pdf_text = ""
        with pdfplumber.open(file) as pdf:
            for page in pdf.pages:
                pdf_text += page.extract_text() or ""

        import re
        result = {
            "ast": re.search(r"Aspartat transaminaz.*?(\d+)\s*U/L", pdf_text).group(1) if re.search(r"Aspartat transaminaz.*?(\d+)\s*U/L", pdf_text) else None,
            "alt": re.search(r"Alanin aminotransferaz.*?(\d+)\s*U/L", pdf_text).group(1) if re.search(r"Alanin aminotransferaz.*?(\d+)\s*U/L", pdf_text) else None,
            "alp": re.search(r"Alkalen fosfataz.*?\(ALP\).*?(\d+)\s*U/L", pdf_text).group(1) if re.search(r"Alkalen fosfataz.*?\(ALP\).*?(\d+)\s*U/L", pdf_text) else None,
            "totalBilirubin": re.search(r"Bilirubin \(total\).*?(\d+\.\d+)\s*mg/dL", pdf_text).group(1) if re.search(r"Bilirubin \(total\).*?(\d+\.\d+)\s*mg/dL", pdf_text) else None,
            "directBilirubin": re.search(r"Bilirubin \(direkt\).*?(\d+\.\d+)\s*mg/dL", pdf_text).group(1) if re.search(r"Bilirubin \(direkt\).*?(\d+\.\d+)\s*mg/dL", pdf_text) else None,
            "albumin": re.search(r"Albümin.*?(\d+\.\d+)\s*g/L", pdf_text).group(1) if re.search(r"Albümin.*?(\d+\.\d+)\s*g/L", pdf_text) else None,
            "platelet": re.search(r"PLT.*?(\d+)\s*10³/µL", pdf_text).group(1) if re.search(r"PLT.*?(\d+)\s*10³/µL", pdf_text) else None
        }

        return jsonify(result)

    except Exception as e:
        import traceback
        print("Hata:", traceback.format_exc())
        return jsonify({"error": str(e)}), 500

@app.route("/login", methods=["POST"])
def login():
    try:
        data = request.get_json()
        username = data.get("username")
        password = data.get("password")

        if not username or not password:
            return jsonify({"success": False, "message": "Kullanıcı adı veya şifre boş."}), 400

        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM users WHERE username = ? AND password = ?", (username, password))
        user = cursor.fetchone()
        conn.close()

        if user:
            return jsonify({"success": True, "message": "Giriş başarılı"})
        else:
            return jsonify({"success": False, "message": "Kullanıcı adı veya şifre yanlış."}), 401

    except Exception as e:
        return jsonify({"success": False, "message": f"Hata: {str(e)}"}), 500

if __name__ == "__main__":
    print("Starting Liver Fibrosis Prediction API...")
    init_db()
    app.run(debug=True, port=5001)