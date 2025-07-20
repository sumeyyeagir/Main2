import React from "react";
import { FiLogOut } from "react-icons/fi"; // Feather Icons'tan çıkış ikonu

const PersonalInfoBar = ({ onLogout }) => {
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

      {/* Sağ: Çıkış Yap Butonu */}
<button
  onClick={onLogout}
  style={{
    backgroundColor: "#ffffffff",
    color: "black",
    padding: "10px 20px",
    borderRadius: "5px",
    border: "none",
    fontWeight: "bold",
    fontSize: "14px",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: "8px",
  }}
>
  <FiLogOut size={18} /> {/* İkon */}
  Çıkış Yap
</button>
    </div>
  );
};

export default PersonalInfoBar;
