import React from "react";

const HastaListesi = () => {
  return (
    <div style={styles.container}>
      <h2 style={styles.baslik}>Hastalar burada listelenecek</h2>
    </div>
  );
};

const styles = {
  container: {
    padding: "40px",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    minHeight: "100vh",
    backgroundColor: "#f9f9f9",
  },
  baslik: {
    color: "#472e7dff",
    fontSize: "24px",
    fontWeight: "bold",
  },
};

export default HastaListesi;