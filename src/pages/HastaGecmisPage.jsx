import React from "react";
import { useLocation } from "react-router-dom";
import hastalar from "./hastalar"; // veya doğru path'e göre değiştir

const HastaGecmisPage = () => {
  const location = useLocation();
  const { tc } = location.state || { tc: null };

  console.log("Gelen TC:", tc);
  console.log("Hastalar:", hastalar);

  const hasta = hastalar.find((h) => h.tc === String(tc)); // TC eşleşmesi için string dönüşümü
  const adSoyad = hasta ? hasta.ad : "Bilinmiyor";

  return (
    <div style={styles.page}>
      <div style={styles.navbar}>
        <h2 style={styles.navTitle}>Doktor Paneli</h2>
      </div>

      <div style={styles.content}>
        <h2 style={styles.header}>Geçmiş Sonuçlar</h2>
        <h4 style={styles.subHeader}>Hasta TC: {tc || "TC bulunamadı"}</h4>
        <h4 style={styles.subHeader}>Ad Soyad: {adSoyad}</h4>
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
};

export default HastaGecmisPage;
