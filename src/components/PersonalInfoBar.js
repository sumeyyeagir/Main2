import React, { useEffect, useState } from "react";
import { FiLogOut } from "react-icons/fi";

const PersonalInfoBar = ({ onLogout }) => {
  const [userName, setUserName] = useState("");

  useEffect(() => {
    const storedName = localStorage.getItem("userName");
    if (storedName) {
      setUserName(storedName);
    }
  }, []);

  const firstLetter = userName?.charAt(0).toUpperCase();

  return (
    <div
      style={{
        backgroundColor: "#213448",
        padding: "10px 30px",
        color: "white",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        width: "100vw",
        height: "80px",
        boxSizing: "border-box",
      }}
    >
      {/* Sol: Logo */}
      <img
        src="/images/istun.logo.white.png"
        alt="İstun Logo"
        style={{
          height: "35px",
          transform: "scale(1.8)",
          transformOrigin: "left center",
        }}
      />

      {/* Orta: Metin */}
      <div
        style={{
          flex: 1,
          textAlign: "center",
          fontStyle: "italic",
          fontSize: "25px",
          color: "#ffffffff",
        }}
      >
        "Erken teşhis hayat kurtarır!"
      </div>

      {/* Sağ: Kullanıcı ve Çıkış */}
      <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end" }}>
        <div style={{ display: "flex", alignItems: "center", marginBottom: "6px" }}>
          {/* Profil Harfi */}
          <div
            style={{
              width: "30px",
              height: "30px",
              borderRadius: "50%",
              backgroundColor: "#ffffff33",
              color: "white",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: "bold",
              marginRight: "10px",
              fontSize: "14px",
            }}
          >
            {firstLetter}
          </div>
          <div style={{ fontSize: "14px", fontWeight: "bold", color: "white" }}>
            {userName}
          </div>
        </div>

        <button
          onClick={() => {
            localStorage.removeItem("userName"); // Çıkarken temizle
            onLogout();
          }}
          style={{
            backgroundColor: "#ffffffff",
            color: "black",
            padding: "6px 14px",
            borderRadius: "5px",
            border: "none",
            fontWeight: "bold",
            fontSize: "13px",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "6px",
          }}
        >
          <FiLogOut size={16} />
          Çıkış Yap
        </button>
      </div>
    </div>
  );
};

export default PersonalInfoBar;
