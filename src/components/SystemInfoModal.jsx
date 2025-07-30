import React, { useState } from "react";
import "./SystemInfoModal.css";

const imageData = [
  { src: "/images/1.png"},
  { src: "/images/2.png"},
  { src: "/images/3.png"},
  { src: "/images/4.png"},
  { src: "/images/5.png"},
  { src: "/images/6.png"},
  { src: "/images/7.png"},
  { src: "/images/8.png"},
  { src: "/images/9.png"},
  { src: "/images/10.png"},
  { src: "/images/11.png"},
  { src: "/images/12.png"},
];

const SystemInfoModal = ({ onClose }) => {
  const [pageIndex, setPageIndex] = useState(0);

  const nextPage = () => {
    if (pageIndex < imageData.length - 1) {
      setPageIndex(pageIndex + 1);
    }
  };

  const prevPage = () => {
    if (pageIndex > 0) {
      setPageIndex(pageIndex - 1);
    }
  };

  const currentImage = imageData[pageIndex];

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2>FibroCheck Bilgilendirme</h2>
          <button className="close-button" onClick={onClose}>×</button>
        </div>

        <div className="modal-body">
          <div className="modal-image-block">
            <img
              className="carousel-image enlarged"
              src={currentImage.src}
              alt={'Görsel ${pageIndex + 1}'}
            />
            <p className="image-description">{currentImage.desc}</p>
          </div>
        </div>

        <div className="modal-footer">
          <div className="footer-controls-fixed">
            <button onClick={prevPage} disabled={pageIndex === 0}>⬅</button>
            <span className="page-indicator">
              Sayfa {pageIndex + 1} / {imageData.length}
            </span>
            <button onClick={nextPage} disabled={pageIndex === imageData.length - 1}>➡</button>
          </div>

          {pageIndex === imageData.length - 1 && (
            <button className="modal-button final-button" onClick={onClose}>
              Anladım
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default SystemInfoModal;
