import React from "react";
import { useLocation } from "react-router-dom";
import hastalar from "./hastalar";

const EvreDetayPage = () => {
  const location = useLocation();
  const { evre } = location.state || { evre: "Bilinmiyor" };

  const filtreliListe = hastalar.filter((h) => h.evre === evre);

  return (
    <div style={styles.page}>
      <div style={styles.navbar}>
        <h2 style={styles.navTitle}>Doktor Paneli</h2>
      </div>

      <div style={styles.content}>
        <h2 style={styles.header}>{evre} Evresine Ait Hastalar</h2>

        {filtreliListe.length === 0 ? (
          <p>Bu evreye ait hasta bulunamadı.</p>
        ) : (
          <div style={styles.tableWrapper}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Ad Soyad</th>
                  <th style={styles.th}>TC</th>
                  <th style={styles.th}>Tarih</th> {/* Evre yerine Tarih */}
                </tr>
              </thead>
              <tbody>
                {filtreliListe.map((h, i) => (
                  <tr key={i} style={i % 2 === 0 ? styles.trEven : styles.trOdd}>
                    <td style={styles.td}>{h.ad}</td>
                    <td style={styles.td}>{h.tc}</td>
                    <td style={styles.td}>2025-07-25</td> {/* Sabit tarih */}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
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
  tableWrapper: {
    overflowX: "auto",
    borderRadius: "8px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    backgroundColor: "white",
  },
  th: {
    backgroundColor: "#213448",
    color: "white",
    padding: "12px",
    textAlign: "left",
    fontSize: "16px",
  },
  td: {
    padding: "12px",
    fontSize: "15px",
    borderBottom: "1px solid #ddd",
    color: "#333",
  },
  trEven: {
    backgroundColor: "#f9f9f9",
  },
  trOdd: {
    backgroundColor: "#ffffff",
  },
};

export default EvreDetayPage;
