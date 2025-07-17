import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import PersonalInfoBar from "../components/PersonalInfoBar";
import "./FormPage.css";
import { data } from "./data";  // ← Veriyi getir



const FormPage = () => {
  const navigate = useNavigate();
  const hasta = data[0]; // İlk hastayı al

  // Hasta bilgileri
  const [tc, setTc] = useState(hasta.tc);
  const [name, setName] = useState(hasta.name);
  const [surname, setSurname] = useState(hasta.surname);
  const [age, setAge] = useState(hasta.age);

  // Kan değerleri
  const [ast, setAst] = useState(hasta.ast);
  const [alt, setAlt] = useState(hasta.alt);
  const [ggt, setGgt] = useState(hasta.ggt);
  const [alp, setAlp] = useState(hasta.alp);
  const [totalBilirubin, setTotalBilirubin] = useState(hasta.totalBilirubin);
  const [directBilirubin, setDirectBilirubin] = useState(hasta.directBilirubin);
  const [albumin, setAlbumin] = useState(hasta.albumin);
  const [inr, setInr] = useState(hasta.inr);
  const [platelet, setPlatelet] = useState(hasta.platelet);
  const [ldh, setLdh] = useState(hasta.ldh);
  const [cbc, setCbc] = useState(hasta.cbc);


  // Görsel dosya ve önizleme url
  const [ultrasoundFile, setUltrasoundFile] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setUltrasoundFile(file);
      setSelectedImage(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async () => {
    const formData = new FormData();

    // Backend ile uyumlu alan isimleri
    formData.append("Total_Bilirubin", totalBilirubin || "0");
    formData.append("Direct_Bilirubin", directBilirubin || "0");
    formData.append("ALP", alp || "0");
    formData.append("ALT", alt || "0");
    formData.append("AST", ast || "0");

    // Backend bekliyor, frontend formunda yok, geçici sıfır atıyoruz
    formData.append("Proteins", "0");
    formData.append("Albumin", albumin || "0");
    formData.append("AG_Ratio", "0");

    if (ultrasoundFile) {
      formData.append("image", ultrasoundFile);
    }

    try {
      const response = await fetch("http://localhost:5001/predict", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) throw new Error("Tahmin API çağrısı başarısız.");

      const result = await response.json();

      navigate("/result", {
        state: {
          tc,
          name,
          surname,
          age,
          labValues: {
            Total_Bilirubin: totalBilirubin,
            Direct_Bilirubin: directBilirubin,
            ALP: alp,
            ALT: alt,
            AST: ast,
            Proteins: 0,
            Albumin: albumin,
            AG_Ratio: 0,
          },
          ultrasoundImage: selectedImage,
          prediction: result.clinic_result,
          imagePrediction: result.image_result,
          confidence: result.confidence,
          llmExplanation: result.llm_explanation,
        },
      });
    } catch (error) {
      alert("Tahmin sırasında bir hata oluştu: " + error.message);
    }
  };

  return (
    <div>
      <PersonalInfoBar />

      <div className="formpage-container">
        <div className="formpage-image-section">
          <h2 className="formpage-title">Ultrason Görüntüsü</h2>
          <div className="formpage-image-box">
            {selectedImage ? (
              <img src={selectedImage} alt="Ultrason" className="formpage-ultrasound-img" />
            ) : (
              <span className="formpage-image-placeholder">Henüz görüntü yüklenmedi</span>
            )}
          </div>
          <div className="formpage-image-btn-box">
            <button
              onClick={() => document.getElementById("imageUpload").click()}
              className="formpage-image-btn"
            >
              {selectedImage ? "Görseli Değiştir" : "Görsel Yükle"}
            </button>
          </div>
          <input
            id="imageUpload"
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            style={{ display: "none" }}
          />
        </div>
        <div className="formpage-info-section">
          <h2 className="formpage-title">Kişisel Bilgiler</h2>
          <div className="formpage-fields-row">
            <Field label="T.C." value={tc} onChange={setTc} />
            <Field label="İsim" value={name} onChange={setName} />
            <Field label="Soyisim" value={surname} onChange={setSurname} />
            <Field label="Yaş" value={age} onChange={setAge} type="number" />
          </div>
          <h2 className="formpage-title">Kan Değerleri</h2>
          <div className="formpage-fields-row">
            <Field label="AST" value={ast} onChange={setAst} type="number" />
            <Field label="ALT" value={alt} onChange={setAlt} type="number" />
            <Field label="GGT" value={ggt} onChange={setGgt} type="number" />
            <Field label="ALP" value={alp} onChange={setAlp} type="number" />
            <Field label="Total Bilirubin" value={totalBilirubin} onChange={setTotalBilirubin} type="number" />
            <Field label="Direkt Bilirubin" value={directBilirubin} onChange={setDirectBilirubin} type="number" />
            <Field label="Albumin" value={albumin} onChange={setAlbumin} type="number" />
            <Field label="INR" value={inr} onChange={setInr} type="number" />
            <Field label="Trombosit (Platelet)" value={platelet} onChange={setPlatelet} type="number" />
            <Field label="LDH" value={ldh} onChange={setLdh} type="number" />
            <Field label="Tam Kan Sayımı (CBC)" value={cbc} onChange={setCbc} type="number" />
          </div>
          <button onClick={handleSubmit} className="formpage-submit-btn">Tahmin Et</button>
        </div>
      </div>
    </div>
  );
};

const Field = ({ label, value, onChange, type = "text" }) => (
  <div style={{ display: "flex", flexDirection: "column", minWidth: "150px" }}>
    <label style={{ marginBottom: "5px", fontWeight: "bold", fontSize: "14px" }}>{label}</label>
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      style={{
        padding: "8px",
        borderRadius: "4px",
        border: "1px solid #ccc",
        fontSize: "14px",
        width: "150px",
      }}
      placeholder={`${label} giriniz`}
      step={type === "number" ? "0.01" : undefined}
    />
  </div>
);

export default FormPage;
