import React, { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from "react-router-dom";

import FormPage from "./pages/FormPage";
import LoginPage from "./pages/LoginPage.jsx";
import ResultPage from "./pages/ResultAndReportPage.js";
import DoktorGirisPage from "./pages/DoktorGirisPage";
import HastaListesiPage from "./pages/HastaListesiPage";
import HastaGecmisPage from "./pages/HastaGecmisPage";
import EvreDetayPage from "./pages/EvreDetayPage";
import NotEklePage from "./pages/NotEklePage"; 
import NotDetayPage from "./pages/NotDetayPage.jsx";

function AppWrapper() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const isAuth = localStorage.getItem("isLoggedIn") === "true";
    setIsLoggedIn(isAuth);
  }, []);

  const handleLogin = () => {
    localStorage.setItem("isLoggedIn", "true");
    setIsLoggedIn(true);
    navigate("/"); // login olduktan sonra yönlendir
  };

  const handleLogout = () => {
    localStorage.removeItem("isLoggedIn");
    setIsLoggedIn(false);
    navigate("/login"); // logout sonrası login'e yönlendir
  };

  return (
    <Routes>
      {!isLoggedIn ? (
        <>
          <Route path="/login" element={<LoginPage onLogin={handleLogin} />} />
          <Route path="*" element={<Navigate to="/login" />} />
        </>
      ) : (
        <>
          <Route path="/" element={<FormPage onLogout={handleLogout} />} />
          <Route path="/result" element={<ResultPage />} />
          <Route path="/doktor-giris" element={<DoktorGirisPage />} />
          <Route path="/hasta-listesi" element={<HastaListesiPage />} />
          <Route path="/hasta-gecmis" element={<HastaGecmisPage />} />
          <Route path="/not-ekle" element={<NotEklePage />} />
          <Route path="/not-detay" element={<NotDetayPage />} />
          <Route path="/evre-detay" element={<EvreDetayPage />} />
          <Route path="*" element={<Navigate to="/" />} />
        </>
      )}
    </Routes>
  );
}

// Router en dışta olmalı
function App() {
  return (
    <BrowserRouter>
      <AppWrapper />
    </BrowserRouter>
  );
}

export default App;
