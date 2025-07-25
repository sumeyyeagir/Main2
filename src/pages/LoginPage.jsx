
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const LoginPage = ({ onLogin }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isHovered, setIsHovered] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async () => {
    if (!username || !password) {
      setError("Lütfen kullanıcı adı ve şifreyi giriniz.");
      return;
    }

    try {
      const response = await fetch("http://localhost:5001/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const result = await response.json();

      if (result.success) {
        setError("");
        localStorage.setItem("userName", username);
        onLogin(); // Üst component'e haber ver
        navigate("/");
      } else {
        setError(result.message || "Giriş başarısız.");
      }
    } catch (error) {
      setError("Sunucuya bağlanılamadı.");
    }
  };

  return (
    <div style={styles.container}>
      <img
        src="/images/karaciger.png"
        alt="Karaciğer Görseli"
        style={styles.sideImage}
      />

      <div
        style={{
          ...styles.card,
          ...(isHovered ? styles.cardHover : {}),
        }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <img src="/images/logo.jpeg" alt="Logo" style={styles.logo} />
        <h2 style={styles.title}>"Bilim Erken Teşhisle Başlar!"</h2>

        <input
          type="text"
          placeholder="Kullanıcı Adı"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          style={styles.input}
        />
        <input
          type="password"
          placeholder="Şifre"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={styles.input}
        />

        {error && <div style={styles.errorText}>{error}</div>}

        <button onClick={handleLogin} style={styles.button}>
          Giriş Yap
        </button>

        <small style={styles.footerText}>© 2025 Fibrozis Tahmin Sistemi</small>
      </div>
    </div>
  );
};

const styles = {
  container: {
    height: "100vh",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    backgroundImage: "linear-gradient(135deg, #f0f2f5 0%, #dce1e7 100%)",
    padding: "20px",
  },
  sideImage: {
    width: "300px",
    maxWidth: "90%",
    marginBottom: "30px",
    marginTop: "-30px",
  },
  card: {
    width: "100%",
    maxWidth: "400px",
    backgroundColor: "#f9f9f9",
    padding: "40px",
    borderRadius: "25px",
    boxShadow: "0 12px 24px rgba(91, 59, 7, 0.61)",
    border: "10px solid #A08963",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    transition: "transform 0.3s ease, box-shadow 0.3s ease",
    cursor: "default",
  },
  cardHover: {
    transform: "scale(1.05)",
    boxShadow: "0 15px 30px rgba(0, 0, 0, 0.2)",
    cursor: "pointer",
  },
  logo: {
    height: "50px",
    marginBottom: "15px",
  },
  title: {
    marginBottom: "20px",
    color: "#213448",
    fontSize: "24px",
    fontWeight: "700",
  },
  input: {
    width: "100%",
    padding: "12px",
    marginBottom: "15px",
    borderRadius: "8px",
    border: "1px solid #ccc",
    fontSize: "14px",
    backgroundColor: "#f2f3f5",
    color: "#333",
    boxShadow: "inset 1px 1px 2px rgba(0,0,0,0.05)",
    transition: "border-color 0.3s ease",
  },
  button: {
    padding: "12px 20px",
    width: "100%",
    backgroundColor: "#213448",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    fontWeight: "700",
    cursor: "pointer",
    fontSize: "16px",
    marginTop: "10px",
    transition: "background-color 0.3s ease",
  },
  footerText: {
    marginTop: "20px",
    color: "#999",
    fontSize: "12px",
  },
  errorText: {
    color: "red",
    marginBottom: "10px",
    fontWeight: "bold",
    textAlign: "center",
    width: "100%",
  },
};

export default LoginPage;