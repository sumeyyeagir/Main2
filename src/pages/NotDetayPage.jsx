import React from "react";
import { useLocation, useNavigate } from "react-router-dom";

const NotDetayPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { not } = location.state || {};

  if (!not) {
    return (
      <div style={styles.container}>
        <p>Not bilgisi bulunamadı.</p>
        <button onClick={() => navigate("/doktor-giris")} style={styles.button}>
          Geri Dön
        </button>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.title}>{not.baslik}</h2>
        <p style={styles.date}>{not.tarih}</p>
        <p style={styles.content}>{not.icerik}</p>
        <button onClick={() => navigate("/doktor-giris")} style={styles.button}>
          Geri Dön
        </button>
      </div>
    </div>
  );
};

const styles = {
  container: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    height: "10vh",
    background: "linear-gradient(135deg, #e3d1b5ff 0%, #dce1e7 100%)",
    padding: "350px",
  },
  card: {
    backgroundColor: "white",
    borderRadius: "15px",
    padding: "50px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
    maxWidth: "800px",
    width: "200%",
  },
  title: {
    color: "#213448",
    fontSize: "34px",
    marginBottom: "10px",
  },
  date: {
    fontSize: "14px",
    color: "#777",
    marginBottom: "30px",
  },
  content: {
    fontSize: "25px",
    color: "#333",
    whiteSpace: "pre-wrap",
    marginBottom: "20px",
  },
  button: {
    padding: "10px 20px",
    backgroundColor: "#213448",
    color: "white",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "16px",
  },
};

export default NotDetayPage;