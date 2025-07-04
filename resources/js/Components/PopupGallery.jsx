// components/PopupGallery.jsx
import { useState } from "react";
import { Dialog } from "primereact/dialog";

export const PopupGallery = ({ images, visible, onHide }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const nextImage = () => {
    setCurrentIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  return (
    <Dialog
      visible={visible}
      onHide={onHide}
      className="popup-gallery"
      dismissableMask
      closable={false}
    >
      <div className="gallery-container">
        <button className="gallery-close" onClick={onHide}>
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
        
        <div className="gallery-main-image">
          <img 
            src={`/storage/${images[currentIndex]?.image}`} 
            alt={`Gallery ${currentIndex + 1}`} 
          />
        </div>
        
        <div className="gallery-controls">
          <button className="gallery-nav prev" onClick={prevImage}>
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6"></polyline>
            </svg>
          </button>
          
          <div className="gallery-thumbnails">
            {images.map((img, index) => (
              <img
                key={index}
                src={`/storage/${img.image}`}
                alt={`Thumbnail ${index + 1}`}
                className={index === currentIndex ? "active" : ""}
                onClick={() => setCurrentIndex(index)}
              />
            ))}
          </div>
          
          <button className="gallery-nav next" onClick={nextImage}>
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 18 15 12 9 6"></polyline>
            </svg>
          </button>
        </div>
      </div>
    </Dialog>
  );
};