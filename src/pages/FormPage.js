// KVKK uyumlu form dosyası (FormPage.js)
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import PersonalInfoBar from "../components/PersonalInfoBar";
import "./FormPage.css";
import Chatbot from "../components/Chatbot";
import LoadingSpinner from "../components/LoadingSpinner";
// ✅ Field bileşeni component DIŞINA alındı (odak hatasını engeller)
const Field = ({ label, value, onChange, type = "text" }) => (
  <div style={{ display: "flex", flexDirection: "column", minWidth: "150px" }}>
    <label
      style={{
        marginBottom: "5px",
        fontWeight: "bold",
        fontSize: "15px",
        color: "#547792",
        fontFamily: "'Poppins', sans-serif",
      }}
    >
      {label}
    </label>
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      style={{
        padding: "8px",
        borderRadius: "4px",
        border: "none",
        boxShadow: "5px 5px 5px rgba(33, 52, 72, 0.51)",
        fontSize: "14px",
        width: "150px",
        outline: "none",
      }}
      placeholder={`${label} giriniz`}
      step={type === "number" ? "0.01" : undefined}
    />
  </div>
);

const FormPage = ({ onLogout }) => {
  const navigate = useNavigate();

  // Hasta bilgileri
  const [tc, setTc] = useState("");
  const [name, setName] = useState("");
  const [surname, setSurname] = useState("");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState("");

  // Kan değerleri
  const [ast, setAst] = useState("");
  const [alt, setAlt] = useState("");
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

  // Yeni loading state
  const [loading, setLoading] = useState(false);

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
        setAlp(result.alp || "");
        setTotalBilirubin(result.totalBilirubin || "");
        setDirectBilirubin(result.directBilirubin || "");
        setAlbumin(result.albumin || "");
        setPlatelet(result.platelet || "");
      } catch (error) {
        alert("PDF işlenemedi: " + error.message);
      }
    }
  };

  const handleSubmit = async () => {
    setLoading(true); // Loading başlat

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

      setLoading(false); // Loading bitir

      navigate("/result", {
        state: {
          tc,
          name,
          surname,
          age,
          gender,
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
      setLoading(false);
      alert("Tahmin sırasında bir hata oluştu: " + error.message);
    }
  };

  return (
    <div>
      <PersonalInfoBar onLogout={onLogout} />
      <Chatbot />

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
              disabled={loading}
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
            disabled={loading}
          />
        </div>

        <div className="formpage-info-section">
          <h2 className="formpage-title">Hasta Bilgileri</h2>
          <div className="formpage-fields-row">
            <Field label="T.C." value={tc} onChange={setTc} />
            <Field label="İsim" value={name} onChange={setName} />
            <Field label="Soyisim" value={surname} onChange={setSurname} />
            <Field label="Yaş" value={age} onChange={setAge} type="number" />
            <div style={{ display: "flex", flexDirection: "column", minWidth: "150px" }}>
              <label
                style={{
                  marginBottom: "5px",
                  fontWeight: "bold",
                  fontSize: "15px",
                  color: "#547792",
                  fontFamily: "Poppins, sans-serif",
                }}
              >
                Cinsiyet
              </label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                style={{
                  padding: "8px",
                  borderRadius: "4px",
                  border: "none",
                  boxShadow: "5px 5px 5px rgba(33, 52, 72, 0.51)",
                  fontSize: "14px",
                  width: "150px",
                  outline: "none",
                  fontFamily: "Poppins, sans-serif",
                }}
                disabled={loading}
              >
                <option value="">Seçiniz</option>
                <option value="Kadın">Kadın</option>
                <option value="Erkek">Erkek</option>
                <option value="Diğer">Diğer</option>
              </select>
            </div>
          </div>

          <h2 className="formpage-title">Kan Değerleri</h2>
          <div style={{ marginBottom: "15px" }}>
            <button
              style={{
                backgroundColor: "#213448",
                color: "white",
                padding: "12px 20px",
                border: "none",
                borderRadius: "8px",
                cursor: "pointer",
                fontSize: "16px",
                fontWeight: "600",
                boxShadow: "0 4px 8px rgba(33, 52, 72, 0.3)",
                transition: "all 0.3s ease",
              }}
              onClick={() => document.getElementById("kanDegeriUpload").click()}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "#304a6e";
                e.currentTarget.style.transform = "scale(1.05)";
                e.currentTarget.style.boxShadow = "0 6px 12px rgba(33, 52, 72, 0.5)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "#213448";
                e.currentTarget.style.transform = "scale(1)";
                e.currentTarget.style.boxShadow = "0 4px 8px rgba(33, 52, 72, 0.3)";
              }}
              disabled={loading}
            >
              <img src="/images/pdf.png" alt="PDF" style={{ width: "30px", height: "30px", marginRight: "5px" }} />
              PDF Olarak Yükle
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
              disabled={loading}
            />
          </div>

          <div className="formpage-fields-row">
            <Field label="AST" value={ast} onChange={setAst} type="number" />
            <Field label="ALT" value={alt} onChange={setAlt} type="number" />
            <Field label="ALP" value={alp} onChange={setAlp} type="number" />
            <Field label="Protein" value={proteins} onChange={setProteins} type="number" />
            <Field label="AG Oranı" value={agRatio} onChange={setAgRatio} type="number" />
            <Field label="Total Bilirubin" value={totalBilirubin} onChange={setTotalBilirubin} type="number" />
            <Field label="Direkt Bilirubin" value={directBilirubin} onChange={setDirectBilirubin} type="number" />
            <Field label="Albumin" value={albumin} onChange={setAlbumin} type="number" />
          </div>

          <button onClick={handleSubmit} className="formpage-submit-btn" disabled={loading}>
            Tahmin Et
          </button>
          
          {loading && <LoadingSpinner />}
          
        </div>
      </div>
    </div>
  );
};

export default FormPage;
