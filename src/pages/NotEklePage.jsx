import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const NotEklePage = () => {
  const [baslik, setBaslik] = useState("");
  const [icerik, setIcerik] = useState("");
  const navigate = useNavigate();

  const handleSubmit = () => {
  if (baslik.trim() && icerik.trim()) {
    const mevcut = JSON.parse(localStorage.getItem("notlar")) || [];

    const yeniNot = {
      baslik,
      icerik,
      tarih: new Date().toLocaleString("tr-TR"),
    };

    localStorage.setItem("notlar", JSON.stringify([yeniNot, ...mevcut]));
    navigate("/doktor-giris");
  } else {
    alert("Lütfen tüm alanları doldurun.");
  }
};


  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        <h2 style={styles.title}>Yeni Not Ekle</h2>

        <input
          type="text"
          placeholder="Başlık"
          value={baslik}
          onChange={(e) => setBaslik(e.target.value)}
          style={styles.input}
        />

        <textarea
          placeholder="Konu"
          value={icerik}
          onChange={(e) => setIcerik(e.target.value)}
          style={styles.textarea}
        />

        <button style={styles.button} onClick={handleSubmit}>
          Gönder
        </button>
      </div>
    </div>
  );
};

const styles = {
  overlay: {
    height: "100vh",
    width: "100vw",
    background: "linear-gradient(135deg, #e3d1b5ff 0%, #dce1e7 100%)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  modal: {
    backgroundColor: "white",
    padding: "30px",
    borderRadius: "10px",
    width: "400px",
    boxShadow: "0 0 20px rgba(0,0,0,0.3)",
    display: "flex",
    flexDirection: "column",
    gap: "16px",
  },
  title: {
    textAlign: "center",
    color: "#213448",
    fontSize: "30px",
    marginBottom: "10px",
  },
  input: {
    padding: "10px",
    fontSize: "16px",
    borderRadius: "6px",
    border: "1px solid #A08963",
  },
  textarea: {
    padding: "10px",
    fontSize: "16px",
    borderRadius: "6px",
    border: "1px solid #A08963",
    height: "100px",
    resize: "none",
  },
  button: {
    padding: "10px",
    backgroundColor: "#213448",
    color: "white",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    fontWeight: "bold",
    fontSize: "16px",
    alignSelf: "flex-end",
  },
};

export default NotEklePage;