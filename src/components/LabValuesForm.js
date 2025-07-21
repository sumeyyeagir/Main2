import React from "react";
import "./LabValuesForm.css";

const LabValuesForm = () => {
  const fields = [
    { label: "AST (Aspartat Aminotransferaz)", placeholder: "AST değeri" },
    { label: "ALT (Alanin Aminotransferaz)", placeholder: "ALT değeri" },
    { label: "ALP (Alkalen Fosfataz)", placeholder: "ALP değeri" },
    { label: "Total Bilirubin", placeholder: "Total Bilirubin" },
    { label: "Direkt Bilirubin", placeholder: "Direkt Bilirubin" },
    { label: "Albumin", placeholder: "Albumin" },
    { label: "LDH", placeholder: "LDH" },
  ];

  return (
    <div className="lab-values-form">

      {fields.map((field, index) => (
        <div className="form-field" key={index}>
          <label>{field.label}</label>
          <input
            type="number"
            step={field.step || "0.01"}
            placeholder={field.placeholder}
          />
        </div>
      ))}

      {/* Her biri %48 genişlikte iki sütun */}
      <div style={{ flex: "0 0 48%" }}>
        <label>AST (Aspartat Aminotransferaz)</label>
        <input type="number" step="0.01" placeholder="AST değeri" />
      </div>

      <div style={{ flex: "0 0 48%" }}>
        <label>ALT (Alanin Aminotransferaz)</label>
        <input type="number" step="0.01" placeholder="ALT değeri" />
      </div>


      <div style={{ flex: "0 0 48%" }}>
        <label>ALP (Alkalen Fosfataz)</label>
        <input type="number" step="0.01" placeholder="ALP değeri" />
      </div>

      <div style={{ flex: "0 0 48%" }}>
        <label>Total Bilirubin</label>
        <input type="number" step="0.01" placeholder="Total Bilirubin" />
      </div>

      <div style={{ flex: "0 0 48%" }}>
        <label>Direkt Bilirubin</label>
        <input type="number" step="0.01" placeholder="Direkt Bilirubin" />
      </div>

      <div style={{ flex: "0 0 48%" }}>
        <label>Albumin</label>
        <input type="number" step="0.01" placeholder="Albumin" />
      </div>

      <div style={{ flex: "0 0 48%" }}>
        <label>INR (International Normalized Ratio)</label>
        <input type="number" step="0.01" placeholder="INR" />
      </div>


      <div style={{ flex: "0 0 48%" }}>
        <label>LDH</label>
        <input type="number" step="0.01" placeholder="LDH" />
      </div>

      <div style={{ flex: "0 0 48%" }}>
        <label>Tam kan sayımı (CBC)</label>
        <input type="number" step="1" placeholder="CBC" />
      </div>

    </div>
  );
};

export default LabValuesForm;
