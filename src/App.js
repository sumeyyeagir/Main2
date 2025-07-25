import React, { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import FormPage from "./pages/FormPage";
import LoginPage from "./pages/LoginPage.jsx";
import ResultPage from "./pages/ResultAndReportPage.js";
import DoktorGirisPage from "./pages/DoktorGirisPage";
import HastaListesiPage from "./pages/HastaListesiPage"; // ✅ Yeni eklenen sayfa
import HastaGecmisPage from "./pages/HastaGecmisPage"; // en üste import et
import EvreDetayPage from "./pages/EvreDetayPage";

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const isAuth = localStorage.getItem("isLoggedIn") === "true";
    setIsLoggedIn(isAuth);
  }, []);

  const handleLogin = () => {
    localStorage.setItem("isLoggedIn", "true");
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    localStorage.removeItem("isLoggedIn");
    setIsLoggedIn(false);
  };

  return (
    <BrowserRouter>
      <Routes>
        {!isLoggedIn ? (
          <>
            {/* Giriş yapılmadıysa her yol login'e yönlendirilir */}
            <Route path="*" element={<Navigate to="/login" />} />
            <Route path="/login" element={<LoginPage onLogin={handleLogin} />} />
          </>
        ) : (
          <>
            {/* Giriş yapıldıysa bu sayfalar erişilebilir */}
            <Route path="/" element={<FormPage onLogout={handleLogout} />} />
            <Route path="/result" element={<ResultPage />} />
            <Route path="/doktor-giris" element={<DoktorGirisPage />} />
            <Route path="/hasta-listesi" element={<HastaListesiPage />} /> {/* ✅ Yeni rota */}
            <Route path="/hasta-gecmis" element={<HastaGecmisPage />} />
<Route path="/evre-detay" element={<EvreDetayPage />} />

            {/* Bilinmeyen yollar anasayfaya yönlendirilir */}
            <Route path="*" element={<Navigate to="/" />} />
          </>
        )}
      </Routes>
    </BrowserRouter>
  );
}

export default App;
