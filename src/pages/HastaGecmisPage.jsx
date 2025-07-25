import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import hastalar from "./hastalar";

const HastaGecmisPage = () => {
  const location = useLocation();
  const { tc } = location.state || { tc: null };
  const [raporlar, setRaporlar] = useState([]);
  const hasta = hastalar.find((h) => h.tc === String(tc));
  const adSoyad = hasta ? hasta.ad : "Bilinmiyor";

  useEffect(() => {
    if (tc) {
      fetch(`http://localhost:5001/get_reports/${tc}`)
        .then((res) => res.json())
        .then((data) => {
          setRaporlar(data.reports || []);
        })
        .catch((err) => console.error("Rapor getirme hatası:", err));
    }
  }, [tc]);

  return (
    <div style={styles.page}>
      <div style={styles.navbar}>
        <h2 style={styles.navTitle}>Doktor Paneli</h2>
      </div>

      <div style={styles.content}>
        <h2 style={styles.header}>Geçmiş Sonuçlar</h2>
        <h4 style={styles.subHeader}>Hasta TC: {tc || "TC bulunamadı"}</h4>
        <h4 style={styles.subHeader}>Ad Soyad: {adSoyad}</h4>

        <div style={styles.reportContainer}>
          {raporlar.length === 0 ? (
            <p>Bu hastaya ait geçmiş rapor bulunamadı.</p>
          ) : (
            raporlar.map((rapor, index) => (
              <div key={index} style={styles.reportCard}>
                <p><strong>Rapor:</strong> {rapor.report_name}</p>
                <p><strong>Tahmin:</strong> {rapor.prediction_result}</p>
                <p><strong>Tarih:</strong> {new Date(rapor.created_at).toLocaleString()}</p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

const styles = {
  page: {
    fontFamily: "sans-serif",
    backgroundColor: "#f4f6f8",
    minHeight: "100vh",
    width: "100vw",
    overflowX: "hidden",
  },
  navbar: {
    backgroundColor: "#213448",
    padding: "20px",
    color: "white",
    textAlign: "center",
  },
  navTitle: {
    margin: 0,
    fontSize: "26px",
  },
  content: {
    padding: "30px",
  },
  header: {
    fontSize: "22px",
    color: "#213448",
    marginBottom: "20px",
  },
  subHeader: {
    fontSize: "18px",
    color: "#555",
    marginBottom: "10px",
  },
  reportContainer: {
    marginTop: "20px",
  },
  reportCard: {
    backgroundColor: "white",
    borderRadius: "10px",
    padding: "15px",
    marginBottom: "15px",
    boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
  },
};

export default HastaGecmisPage;
