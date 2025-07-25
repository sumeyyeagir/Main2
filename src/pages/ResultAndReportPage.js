import React, { useRef, useEffect } from "react";
import { useLocation } from "react-router-dom";
import "./ResultAndReportPage.css";
// import html2canvas from "html2canvas";
// import jsPDF from "jspdf";
import html2pdf from "html2pdf.js";  // html2pdf'yi import ettik
import Chatbot from "../components/Chatbot";

const ResultAndReportPage = () => {
  const reportRef = useRef();
  const location = useLocation();

  const hastaVerisi = location.state || {};

  const {
    prediction,
    imagePrediction,
    confidence,
    llmExplanation,
    name,
    surname,
    tc,
    age,
    labValues,
    ultrasoundImage,
    gender,
  } = hastaVerisi;

  const currentDate = new Date().toLocaleDateString("tr-TR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const labelFromPrediction = (value) => {
    if (value === 0 || value === "0") return "Sağlıklı";
    if (value === 1 || value === "1") return "Hasta";
    return value;
  };

  // Senin istediğin yeni downloadPDF fonksiyonu
  const downloadPDF = () => {
    const element = reportRef.current;

    const opt = {
      margin: 10,
      filename: "saglik-raporu.pdf",
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
      pagebreak: { mode: ["avoid-all", "css", "legacy"] },
    };

    html2pdf().set(opt).from(element).save();
  };

  useEffect(() => {
    if (tc && llmExplanation) {
      fetch("http://localhost:5001/add_report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tc_no: tc,
          report_text: llmExplanation,
          name,
          surname,
          age,
          gender,
          evre: imagePrediction,
        }),
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.success) {
            console.log("Rapor başarıyla kaydedildi.");
          } else {
            console.error("Rapor kaydedilirken hata:", data.message);
          }
        })
        .catch((err) => {
          console.error("Rapor kaydetme hatası:", err);
        });
    }
  }, [tc, llmExplanation]);

  return (
    <div className="report-page">
      <Chatbot />
      <div className="report-container" ref={reportRef}>
        {/* ... (rapor içeriği aynı kalacak) */}
        <div className="header">
          <img src="/images/istun_logo.png" alt="Logo" className="logo" />
          <div className="title">
            <h3>
              İSTANBUL SAĞLIK VE TEKNOLOJİ ÜNİVERSİTESİ <br />
              <strong>FİBROZİS TAHMİN VE DEĞERLENDİRME RAPORU</strong>
            </h3>
          </div>
        </div>

        <div className="section">
          <h4>HASTANIN:</h4>
          <table>
            <tbody>
              <tr>
                <td>Adı ve Soyadı:</td>
                <td>
                  {name} {surname}
                </td>
              </tr>
              <tr>
                <td>T.C. Kimlik No:</td>
                <td>{tc}</td>
              </tr>
              <tr>
                <td>Yaş:</td>
                <td>{age}</td>
              </tr>
              <tr>
                <td>Cinsiyet:</td>
                <td>{gender}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="section">
          <h4>FİBROZİS EVRE TAHMİNİ:</h4>
          <div className="box">
            {prediction !== undefined && (
              <p>RF Model Tahmini: {labelFromPrediction(prediction)}</p>
            )}
            {imagePrediction !== undefined && (
              <p>
                CNN Model Tahmini: {labelFromPrediction(imagePrediction)} (%{confidence})
              </p>
            )}
          </div>
        </div>

        <div className="section">
          <h4>YAPAY ZEKA YORUMU:</h4>
          <div className="box">{llmExplanation || "Yorum yok."}</div>
        </div>

        <div className="section">
          <h4>KAN DEĞERLERİ:</h4>
          <table>
            <tbody>
              {labValues &&
                Object.entries(labValues).map(([key, value]) => (
                  <tr key={key}>
                    <td>{key}</td>
                    <td>{value}</td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>

        <div className="section">
          <h4>ULTRASON GÖRÜNTÜSÜ:</h4>
          {ultrasoundImage ? (
            <img
              src={ultrasoundImage}
              alt="Ultrason Görüntüsü"
              style={{ maxWidth: "100%", height: "auto" }}
            />
          ) : (
            <p>Ultrason görüntüsü yüklenmedi.</p>
          )}
        </div>

        <div className="notes">
          <p>(*) Rapor tarihi: {currentDate}</p>
          <p>
            (**) Fibrozis Evre Tahmini bölümünde Kan Değerleri ve Ultrason Görüntüsü bilgileriyle
            eğitilmiş yapay zeka tahmin sonu bulunmaktadır.
          </p>
        </div>
      </div>

      <button className="download-button" onClick={downloadPDF}>
        Raporu PDF Olarak İndir
      </button>
    </div>
  );
};

export default ResultAndReportPage;