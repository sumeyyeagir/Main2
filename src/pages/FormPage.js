// KVKK uyumlu form dosyası (FormPage.js)
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import PersonalInfoBar from "../components/PersonalInfoBar";
import "./FormPage.css";

const FormPage = ({ onLogout }) => {
  const navigate = useNavigate();

  // Hasta bilgileri
  const [tc, setTc] = useState("");
  const [name, setName] = useState("");
  const [surname, setSurname] = useState("");
  const [age, setAge] = useState("");

  // Kan değerleri
  const [ast, setAst] = useState("");
  const [alt, setAlt] = useState("");
  const [ggt, setGgt] = useState("");
  const [alp, setAlp] = useState("");
  const [totalBilirubin, setTotalBilirubin] = useState("");
  const [directBilirubin, setDirectBilirubin] = useState("");
  const [albumin, setAlbumin] = useState("");
  const [platelet, setPlatelet] = useState("");
  const [agRatio, setAgRatio] = useState("");
  const [proteins, setProteins] = useState("");

  const [ultrasoundFile, setUltrasoundFile] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [kanDegeriDosyasi, setKanDegeriDosyasi] = useState(null);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setUltrasoundFile(file);
      setSelectedImage(URL.createObjectURL(file));
    }
  };

  const handleKanDegeriUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      setKanDegeriDosyasi(file);
      const formData = new FormData();
      formData.append("file", file);

      try {
        const response = await fetch("http://localhost:5000/parse", {
          method: "POST",
          body: formData,
        });

        if (!response.ok) throw new Error("PDF dosyası okunamadı.");

        const result = await response.json();

        setAst(result.ast || "");
        setAlt(result.alt || "");
        setGgt(result.ggt || "");
        setAlp(result.alp || "");
        setTotalBilirubin(result.totalBilirubin || "");
        setDirectBilirubin(result.directBilirubin || "");
        setAlbumin(result.albumin || "");
        setPlatelet(result.platelet || "");
        // Eklenmediyse boş bırakılabilir
      } catch (error) {
        alert("PDF işlenemedi: " + error.message);
      }
    }
  };

  const handleSubmit = async () => {
    const formData = new FormData();
    formData.append("Total_Bilirubin", totalBilirubin || "0");
    formData.append("Direct_Bilirubin", directBilirubin || "0");
    formData.append("ALP", alp || "0");
    formData.append("ALT", alt || "0");
    formData.append("AST", ast || "0");
    formData.append("Proteins", proteins || "0");
    formData.append("Albumin", albumin || "0");
    formData.append("AG_Ratio", agRatio || "0");

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
            Proteins: proteins,
            Albumin: albumin,
            AG_Ratio: agRatio,
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

  return (
    <div>
      <PersonalInfoBar onLogout={onLogout} />
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
            <button onClick={() => document.getElementById("imageUpload").click()} className="formpage-image-btn">
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
          <div style={{ marginBottom: "15px" }}>
            <button
              style={{
                backgroundColor: "#2E7D32",
                color: "white",
                padding: "10px 16px",
                border: "none",
                borderRadius: "5px",
                cursor: "pointer",
                fontSize: "14px",
              }}
              onClick={() => document.getElementById("kanDegeriUpload").click()}
            >
              Dosya Yükle
            </button>
            {kanDegeriDosyasi && (
              <span style={{ marginLeft: 10, fontSize: "14px" }}>{kanDegeriDosyasi.name}</span>
            )}
            <input
              id="kanDegeriUpload"
              type="file"
              accept="application/pdf"
              onChange={handleKanDegeriUpload}
              style={{ display: "none" }}
            />
          </div>

          <div className="formpage-fields-row">
            <Field label="AST" value={ast} onChange={setAst} type="number" />
            <Field label="ALT" value={alt} onChange={setAlt} type="number" />
            <Field label="GGT" value={ggt} onChange={setGgt} type="number" />
            <Field label="ALP" value={alp} onChange={setAlp} type="number" />
            <Field label="Protein" value={proteins} onChange={setProteins} type="number" />
            <Field label="AG Oranı" value={agRatio} onChange={setAgRatio} type="number" />
            <Field label="Total Bilirubin" value={totalBilirubin} onChange={setTotalBilirubin} type="number" />
            <Field label="Direkt Bilirubin" value={directBilirubin} onChange={setDirectBilirubin} type="number" />
            <Field label="Albumin" value={albumin} onChange={setAlbumin} type="number" />
            <Field label="Trombosit (Platelet)" value={platelet} onChange={setPlatelet} type="number" />
          </div>

          <button onClick={handleSubmit} className="formpage-submit-btn">
            Tahmin Et
          </button>
        </div>
      </div>
    </div>
  );
};

export default FormPage;
