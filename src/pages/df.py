import fitz  # PyMuPDF
import re
import json

# 1. React'teki değişken adlarını PDF'teki test adlarıyla eşleştir
test_map = {
    "Aspartat transaminaz\n(AST)": "ast",
    "Alanin aminotransferaz\n(ALT)": "alt",
    "Gamma glutamil\ntransferaz (GGT)": "ggt",
    "Alkalen fosfataz (ALP)": "alp",
    "Bilirubin (total)": "totalBilirubin",
    "Bilirubin (direkt)": "directBilirubin",
    "Albümin": "albumin",
    "PLT": "platelet",
    "Laktat dehidrogenaz (LDH)": "ldh",
    
}

# 2. PDF'ten veriyi okuyan ve eşleyen fonksiyon
def extract_pdf_values_for_react(path, test_map):
    doc = fitz.open(path)
    text = "".join([page.get_text() for page in doc])
    
    react_data = {}

    for pdf_label, react_key in test_map.items():
        pattern = rf"{re.escape(pdf_label)}\s+([0-9.,]+)\s+([a-zA-Z%µ/]+)"
        match = re.search(pattern, text)
        if match:
            value = match.group(1).replace(",", ".")
            try:
                react_data[react_key] = float(value)
            except:
                react_data[react_key] = value
        else:
            react_data[react_key] = ""  # React formu için boş string döndür
    
    return react_data

# 3. Kullanım: PDF'ten oku ve JSON formatında React'e uygun hale getir
pdf_path = r"C:\Users\ervae\Downloads\Proje-main\src\pages\Enabiz-Tahlilleri.pdf"  # kendi yolunu yaz
react_ready_data = extract_pdf_values_for_react(pdf_path, test_map)

# 4. (Opsiyonel) JSON olarak dışa aktar — Frontend'e gönderilebilir
with open("react_data.json", "w", encoding="utf-8") as f:
    json.dump(react_ready_data, f, indent=2)

# 5. Konsola bastır (isteğe bağlı)
print(json.dumps(react_ready_data, indent=2))
