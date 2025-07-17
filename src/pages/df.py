import json
import pandas as pd

data = [
  {
    'name': "Ahmet",
    'age': 25,
    'city': "Ankara",
    'ast': 33,
    'alt': 42,
    'ggt': 12,
    'alp': 101,
    'totalBilirubin': 0.5,
    'directBilirubin': 0.2,
    'albumin': 4.1,
    "inr": 1.0,
    "platelet": 245,
    "ldh": 180,
    "cbc": "Normal",
    "tc": "12345678901",
    "surname": "Yılmaz"
  }
]

df = pd.DataFrame(data)
 

# Python'daki veri (örnek)



dict_data = df.to_dict(orient="records")  # Tekrar liste içinde sözlük formatına döner
print(dict_data)

# JSON formatında string oluştur, Türkçe karakterler düzgün kalsın, güzel yazılsın

json_data = json.dumps(data, indent=2, ensure_ascii=False)

 

# JS modül formatında dosyaya yaz

with open(r"C:\Users\ervae\Downloads\Proje-main\src\pages\data.js", "a", encoding="utf-8") as f:
    f.write(f"export const data = {json_data};\n")
 

print("data.js dosyasına başarıyla yazıldı.")