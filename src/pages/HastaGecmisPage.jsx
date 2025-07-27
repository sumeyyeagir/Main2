import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import hastalar from "./hastalar";
import Markdown from "markdown-to-jsx";
import PersonalInfoBar2 from "../components/PersonalInfoBar2";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
const HastaGecmisPage = () => {
  const location = useLocation();
  const { tc } = location.state || { tc: null };
  const [raporlar, setRaporlar] = useState([]);
  const [expandedIndex, setExpandedIndex] = useState(null); // 👈 hangi rapor açık?
  const [hasta, setHasta] = useState(null); 

  const navigate = useNavigate();

  useEffect(() => {
    if (tc) {
      // Hasta bilgisi çek (ad soyad vs)
       fetch(`http://localhost:5001/patients/${tc}`)
        .then((res) => res.json())
        .then((data) => {
          setHasta(data);
        })
        .catch((err) => console.error("Hasta bilgisi çekme hatası:", err));

      // Raporları çek
      fetch(`http://localhost:5001/get_reports/${tc}`)
        .then((res) => res.json())
        .then((data) => {
          setRaporlar(data.reports || []);
        })
        .catch((err) => console.error("Rapor getirme hatası:", err));
    }
  }, [tc]);

  const toggleExpand = (index) => {
    setExpandedIndex(expandedIndex === index ? null : index);
  };
  const evreData = [
    { tarih: "2023-05-01", evre: 4 },
    { tarih: "2023-04-01", evre: 2 },
    { tarih: "2023-03-01", evre: 3 },
    { tarih: "2023-02-01", evre: 2 },
    { tarih: "2023-01-01", evre: 1 },
  ];

  const evreLabels = {
    0: "F0",
    1: "F1",
    2: "F2",
    3: "F3",
    4: "F4",
  };

  const evreYorum = {
    1: "Fibrozis başlangıcı (F1) gözlemlenmiştir. Düzenli takip önerilir.",
    2: "Orta düzey fibrozis (F2). Yaşam tarzı değişiklikleri önemlidir.",
    3: "İleri fibrozis (F3). Tedavi planı dikkatle izlenmelidir.",
    4: "Siroz başlangıcı (F4). Uzman takibi ve tedavi zorunludur.",
  };

  const kanData = [
    {
      tarih: "2023-05-01",
      AST: 37,
      ALT: 41,
      ALP: 92,
      Protein: 7.4,
      "AG Oranı": 1.4,
      "Total Bilirubin": 1.3,
      "Direkt Bilirubin": 0.4,
      Albumin: 4.3,
    },
    {
      tarih: "2023-04-01",
      AST: 36,
      ALT: 39,
      ALP: 88,
      Protein: 7.1,
      "AG Oranı": 1.2,
      "Total Bilirubin": 1.0,
      "Direkt Bilirubin": 0.3,
      Albumin: 4.0,
    },
    {
      tarih: "2023-03-01",
      AST: 40,
      ALT: 45,
      ALP: 95,
      Protein: 7.3,
      "AG Oranı": 1.3,
      "Total Bilirubin": 1.2,
      "Direkt Bilirubin": 0.4,
      Albumin: 4.2,
    },
    {
      tarih: "2023-02-01",
      AST: 38,
      ALT: 42,
      ALP: 85,
      Protein: 7.0,
      "AG Oranı": 1.1,
      "Total Bilirubin": 1.0,
      "Direkt Bilirubin": 0.2,
      Albumin: 4.0,
    },
    {
      tarih: "2023-01-01",
      AST: 35,
      ALT: 40,
      ALP: 90,
      Protein: 7.2,
      "AG Oranı": 1.2,
      "Total Bilirubin": 1.1,
      "Direkt Bilirubin": 0.3,
      Albumin: 4.1,
    },
  ];

  const renkler = {
    AST: "#1f77b4",
    ALT: "#ff7f0e",
    ALP: "#2ca02c",
    Protein: "#d62728",
    "AG Oranı": "#9467bd",
    "Total Bilirubin": "#8c564b",
    "Direkt Bilirubin": "#e377c2",
    Albumin: "#7f7f7f",
  };
  return (
    <div style={styles.page}>
      <PersonalInfoBar2 onLogout={() => navigate("/")} />

      <div style={styles.content}>
        <h2 style={styles.header}>Geçmiş Sonuçlar</h2>
        <h4 style={styles.subHeader}>Hasta TC: {tc || "TC bulunamadı"}</h4>
        <h4 style={styles.subHeader}>Ad Soyad:{hasta ? `${hasta.ad} ${hasta.soyad}` : "Bilinmiyor"} </h4>
        <div style={styles.chartsRow}>
          <div style={styles.chartBoxSmall}>
            <h3 style={styles.chartTitle}>Evre Değişimi</h3>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={[...evreData].reverse()}>
                <CartesianGrid stroke="#ccc" horizontal={true} vertical={false} />
                <XAxis dataKey="tarih" />
                <YAxis
                  type="number"
                  domain={[0, 4]}
                  ticks={[0, 1, 2, 3, 4]}
                  tickFormatter={(tick) => evreLabels[tick] || ""}
                  allowDecimals={false}
                />
                <Tooltip
                  formatter={(value) => evreLabels[value] || value}
                  labelFormatter={(label) => `Tarih: ${label}`}/>
                <Line
                  type="monotone"
                  dataKey="evre"
                  stroke="#007bff"
                  strokeWidth={3}
                  dot={{ r: 6 }}
                  activeDot={{ r: 8 }}
                  isAnimationActive={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div style={styles.chartBoxLarge}>
            <h3 style={styles.chartTitle}>Kan Değerleri</h3>
            <ResponsiveContainer width="100%" height={350}>
              <LineChart data={kanData}>
                <CartesianGrid stroke="#ccc" />
                <XAxis dataKey="tarih" />
                <YAxis />
                <Tooltip />
                <Legend verticalAlign="top" height={36} />
                {Object.keys(renkler).map((key) => (
                  <Line
                    key={key}
                    type="monotone"
                    dataKey={key}
                    stroke={renkler[key]}
                    strokeWidth={2}
                    dot={false}
                    activeDot={{ r: 6 }}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div style={styles.reportContainer}>
          {raporlar.length === 0 ? (
            <p>Bu hastaya ait geçmiş rapor bulunamadı.</p>
          ) : (
            raporlar.map((rapor, index) => {
              const isOpen = expandedIndex === index;
              return (
                <div
                  key={index}
                  style={{
                    ...styles.reportCard,
                    cursor: "pointer",
                    backgroundColor: isOpen ? "#eaf3fc" : "white",
                  }}
                  onClick={() => toggleExpand(index)}
                >
                  <p style={styles.timestamp}>
                    📅 {new Date(rapor.created_at).toLocaleString()}
                  </p>

                  {isOpen && (
                    <div style={styles.markdown}>
                      <p><strong>Rapor:</strong> {rapor.report_name}</p>
                      <p><strong>Tahmin:</strong></p>
                      <Markdown options={{ forceBlock: true }}>
                        {rapor.prediction_result}
                      </Markdown>
                    </div>
                  )}
                </div>
              );
            })
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
    borderRadius: "10px",
    padding: "15px",
    marginBottom: "15px",
    boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
    transition: "background-color 0.3s ease",
  },
  timestamp: {
    fontWeight: "bold",
    fontSize: "16px",
    color: "#213448",
    marginBottom: "5px",
  },
  markdown: {
    marginTop: "10px",
    color: "#333",
    fontSize: "15px",
    lineHeight: "1.6",
  },
  chartsRow: {
    display: "flex",
    gap: "30px",
    flexWrap: "wrap",
    alignItems: "flex-start",
    marginBottom: 40,
  },
  chartBoxSmall: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 20,
    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
    height: 470,
    flex: "1 1 400px",
    minWidth: 300,
    display: "flex",
    flexDirection: "column",
    justifyContent: "flex-start",
  },
  chartBoxLarge: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 20,
    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
    height: 470,
    flex: "2 1 400px",
    minWidth: 400,
  },
  chartTitle: {
    color: "#213448",
    fontSize: 22,
    marginBottom: 16,
    textAlign: "center",
  },
  
  reportHeader: {
    fontSize: 22,
    color: "#213448",
    marginBottom: 20,
  },
  reportBox: {
    backgroundColor: "#ffffff",
    padding: 20,
    marginBottom: 20,
    borderRadius: 12,
    boxShadow: "0 2px 10px rgba(0,0,0,0.08)",
  },
  reportTitle: {
    marginBottom: 10,
    fontSize: 18,
    color: "#2c3e50",
  },
};

export default HastaGecmisPage;
