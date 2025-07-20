import React from "react";
import "./LabValuesForm.css";

const LabValuesForm = () => {
  const fields = [
    { label: "AST (Aspartat Aminotransferaz)", placeholder: "AST değeri" },
    { label: "ALT (Alanin Aminotransferaz)", placeholder: "ALT değeri" },
    { label: "GGT (Gama Glutamil Transferaz)", placeholder: "GGT değeri" },
    { label: "ALP (Alkalen Fosfataz)", placeholder: "ALP değeri" },
    { label: "Total Bilirubin", placeholder: "Total Bilirubin" },
    { label: "Direkt Bilirubin", placeholder: "Direkt Bilirubin" },
    { label: "Albumin", placeholder: "Albumin" },
    { label: "Trombosit (Platelet) sayısı", placeholder: "Trombosit sayısı", step: "1" },
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
    </div>
  );
};

export default LabValuesForm;
