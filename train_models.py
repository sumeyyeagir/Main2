import pandas as pd
import numpy as np
import pickle
import os
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import StandardScaler
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import Conv2D, MaxPooling2D, Flatten, Dense, Dropout
from tensorflow.keras.optimizers import Adam 
from tensorflow.keras.utils import to_categorical
from sklearn.model_selection import train_test_split
from zipfile import ZipFile
from PIL import Image

# 🔹 Klinik Verilerle RF Model Eğitimi 🔹
print("🎓 Klinik veriler yükleniyor ve model eğitiliyor...")

df = pd.read_csv("/Users/busrainan/Desktop/new5/Main/DataSets/Liver Patient Dataset (LPD)_train.csv", encoding='ISO-8859-1')
df.columns = df.columns.str.strip().str.replace('\xa0', ' ').str.replace('  ', ' ')
df['Gender of the patient'] = 0
df['Result'] = df['Result'].map({1: 1, 2: 0})
df.fillna(df.mean(), inplace=True)

clinic_features = [
    'Total Bilirubin', 'Direct Bilirubin',
    'Alkphos Alkaline Phosphotase', 'Sgpt Alamine Aminotransferase',
    'Sgot Aspartate Aminotransferase', 'Total Protiens',
    'ALB Albumin', 'A/G Ratio Albumin and Globulin Ratio'
]

X = df[clinic_features]
y = df['Result']

from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, classification_report

# 🎯 %80 eğitim / %20 test ayrımı
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, stratify=y, random_state=42
)

# 🔄 Standardizasyon
scaler = StandardScaler()
X_train_scaled = scaler.fit_transform(X_train)
X_test_scaled = scaler.transform(X_test)

# 🌳 Model eğitimi
rf_model = RandomForestClassifier(random_state=42)
rf_model.fit(X_train_scaled, y_train)

# 🎯 Değerlendirme
y_pred = rf_model.predict(X_test_scaled)
print("\n🎯 Test Doğruluğu: {:.2f}%".format(accuracy_score(y_test, y_pred) * 100))
print("\n📊 Sınıflandırma Raporu:\n", classification_report(y_test, y_pred))

# 💾 Model ve scaler dosyaları
with open("scaler.pkl", "wb") as f:
    pickle.dump(scaler, f)

with open("rf_model.pkl", "wb") as f:
    pickle.dump(rf_model, f)

# 💾 Test verilerini kaydet (etiketli ve etiketsiz)
pd.DataFrame(X_test).to_csv("X_test_unlabeled.csv", index=False)
pd.concat([pd.DataFrame(X_test).reset_index(drop=True), y_test.reset_index(drop=True)], axis=1).to_csv("X_test_labeled.csv", index=False)

print("✅ Model ve test CSV dosyaları başarıyla kaydedildi:")
print("- rf_model.pkl")
print("- scaler.pkl")
print("- X_test_unlabeled.csv")
print("- X_test_labeled.csv")

#----------------------------------------------------------------------------------------------
# 🔹 Görüntü Verileriyle CNN Eğitimi 🔹
print("🖼️ Görüntü verisi işleniyor ve CNN modeli eğitiliyor...")

class_labels = ['F0', 'F1', 'F2', 'F3', 'F4']
image_paths = []
labels = []

# ZIP'ten çıkar (eğer çıkmadıysa)
#if not os.path.exists("liver_data"):
   # with ZipFile("", 'r') as zip_ref:
    #    zip_ref.extractall("liver_data")

image_folder = "/Users/busrainan/Desktop/new5/Main/Dataset-2"
for label in class_labels:
    class_folder = os.path.join(image_folder, label)
    if os.path.exists(class_folder):
        for img_name in os.listdir(class_folder):
            if img_name.lower().endswith(('.png', '.jpg', '.jpeg')):
                image_paths.append(os.path.join(class_folder, img_name))
                labels.append(label)

data = pd.DataFrame({
    'Image_Path': image_paths,
    'Label': labels
})

train_data, test_data = train_test_split(
    data, test_size=0.2, stratify=data['Label'], random_state=42
)

def load_and_preprocess_images(df, img_size=(128, 128)):
    images = []
    labels = []
    for _, row in df.iterrows():
        try:
            img = Image.open(row['Image_Path']).convert('RGB')
            img = img.resize(img_size)
            img_array = np.array(img) / 255.0
            images.append(img_array)
            labels.append(class_labels.index(row['Label']))
        except Exception as e:
            print(f"Hata: {row['Image_Path']} - {str(e)}")
    labels = to_categorical(labels, num_classes=len(class_labels))
    return np.array(images), labels

X_train, y_train = load_and_preprocess_images(train_data)
X_test, y_test = load_and_preprocess_images(test_data)

model = Sequential([
    Conv2D(32, (3,3), activation='relu', input_shape=(128,128,3)),
    MaxPooling2D(2,2),
    Conv2D(64, (3,3), activation='relu'),
    MaxPooling2D(2,2),
    Flatten(),
    Dense(128, activation='relu'),
    Dropout(0.5),
    Dense(len(class_labels), activation='softmax')
])

model.compile(optimizer=Adam(learning_rate=0.0005), loss='categorical_crossentropy', metrics=['accuracy'])

history = model.fit(X_train, y_train, validation_data=(X_test, y_test), epochs=5, batch_size=32)

model.save("cnn_model.h5")
print("✅ cnn_model.h5 başarıyla kaydedildi.\n")
print("🏁 Tüm modeller başarıyla eğitildi ve kaydedildi.")
