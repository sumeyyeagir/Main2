import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const LoginPage = ({ onLogin }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");  // Hata durumu için
  const navigate = useNavigate();

  // Örnek sabit kullanıcı adı ve şifre (dilediğin gibi değiştir)
  const users = [
    { username: "erva.ergul", password: "123456" },
    { username: "busra.inan", password: "123456" },
    { username: "ege.kuzu", password: "123456" },
    { username: "kevser.semiz", password: "123456" },
    { username: "helin.ozalkan", password: "123456" },
    { username: "sumeyye.agir", password: "123456" },
    { username: "efe.kesler", password: "123456" },
    { username: "devran.sahin", password: "123456" },
    { username: "cengizhan.karaman", password: "123456" },
    { username: "enes.coban", password: "123456" },
    { username: "kerem.guney", password: "123456" }
  ];

  const handleLogin = () => {
  if (!username || !password) {
    setError("Lütfen kullanıcı adı ve şifreyi boş bırakmayınız.");
    return;
  }

  const foundUser = users.find(
    (user) => user.username === username && user.password === password
  );

  if (foundUser) {
    setError("");
    onLogin();
    navigate("/");
  } else {
    setError("Kullanıcı adı veya şifre yanlış.");
  }
};

  return (
    <div style={styles.container}>
      {/* Sol: Login kartı */}
      <div style={styles.card}>
        <img src="/images/istun_logo.png" alt="Logo" style={styles.logo} />
        <h2 style={styles.title}>Giriş Yap</h2>

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

        {/* Hata mesajı */}
        {error && (
          <div
            style={{
              color: "red",
              marginBottom: "10px",
              fontWeight: "bold",
              textAlign: "center",
              width: "100%",
            }}
          >
            {error}
          </div>
        )}

        <button onClick={handleLogin} style={styles.button}>
          Giriş Yap
        </button>
        <small style={styles.footerText}>© 2025 Fibrozis Tahmin Sistemi</small>
      </div>

      {/* Sağ: Görsel ve slogan */}
      <div style={styles.imageSection}>
        <h2 style={styles.slogan}>"Bilim, erken teşhiste başlar."</h2>
        <img
          src="/images/karaciger.png"
          alt="Karaciğer Görseli"
          style={styles.sideImage}
        />
      </div>
    </div>
  );
};

const styles = {
  container: {
    height: "100vh",
    display: "flex",
    flexDirection: "row",
    backgroundColor: "#ffffff",
  },
  card: {
    flex: 1,
    maxWidth: "400px",
    backgroundColor: "#f0f0f0",
    margin: "auto",
    padding: "40px",
    marginLeft: "220px",
    borderRadius: "12px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
  logo: {
    height: "50px",
    marginBottom: "15px",
  },
  title: {
    marginBottom: "20px",
    color: "#2E7D32",
    fontSize: "24px",
  },
  input: {
    width: "100%",
    padding: "10px",
    marginBottom: "15px",
    borderRadius: "6px",
    border: "1px solid #ccc",
    fontSize: "14px",
  },
  button: {
    padding: "10px 20px",
    width: "100%",
    backgroundColor: "#2E7D32",
    color: "#fff",
    border: "none",
    borderRadius: "6px",
    fontWeight: "bold",
    cursor: "pointer",
    fontSize: "16px",
    marginTop: "10px",
  },
  footerText: {
    marginTop: "20px",
    color: "#999",
    fontSize: "12px",
  },
  imageSection: {
    flex: 1,
    padding: "50px",
    marginLeft: "100px",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "transparent",
    position: "relative",
    top: "-30px",
  },
  sideImage: {
    width: "300px",
    maxWidth: "80%",
    borderRadius: "0",
    boxShadow: "none",
  },
  slogan: {
    fontSize: "24px",
    fontStyle: "italic",
    color: "#2E7D32",
    marginBottom: "30px",
    textAlign: "center",
    maxWidth: "80%",
  },
};

export default LoginPage;
