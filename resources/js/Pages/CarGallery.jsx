import React from 'react';
import PropTypes from 'prop-types';

const CarGallery = ({ car }) => {
  return (
    <div className="car-gallery">
      <div className="gallery-header">
        <h2>{car?.name || 'Vehicle'} Gallery</h2>
        <p className="image-count">{car?.initial_gallery?.length || 0} Photos</p>
      </div>

      <div className="gallery-grid">
        {car?.initial_gallery?.map((image, index) => (
          <div key={index} className="gallery-item">
            <div className="image-container">
              <img
                src={`/storage/${image.image}`}
                alt={`${car?.name || 'Car'} view ${index + 1}`}
                loading="lazy"
              />
            </div>
            {image.caption && (
              <p className="image-caption">{image.caption}</p>
            )}
          </div>
        ))}
      </div>

      <style jsx>{`
        .car-gallery {
          max-width: 1200px;
          margin: 0 auto;
          padding: 2rem;
        }
        
        .gallery-header {
          text-align: center;
          margin-bottom: 2rem;
        }
        
        .gallery-header h2 {
          font-size: 2rem;
          color: #333;
          margin-bottom: 0.5rem;
        }
        
        .image-count {
          color: #666;
          font-size: 1.1rem;
        }
        
        .gallery-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 1.5rem;
        }
        
        .gallery-item {
          border-radius: 8px;
          overflow: hidden;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          transition: transform 0.3s ease, box-shadow 0.3s ease;
          background: white;
        }
        
        .gallery-item:hover {
          transform: translateY(-5px);
          box-shadow: 0 10px 15px rgba(0, 0, 0, 0.1);
        }
        
        .image-container {
          position: relative;
          padding-top: 56.25%; /* 16:9 Aspect Ratio */
        }
        
        .image-container img {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        
        .image-caption {
          padding: 1rem;
          margin: 0;
          color: #555;
          font-size: 0.9rem;
        }
        
        @media (max-width: 768px) {
          .gallery-grid {
            grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
          }
        }
      `}</style>
    </div>
  );
};

CarGallery.propTypes = {
  car: PropTypes.shape({
    name: PropTypes.string,
    initial_gallery: PropTypes.arrayOf(
      PropTypes.shape({
        image: PropTypes.string.isRequired,
        caption: PropTypes.string
      })
    )
  })
};

export default CarGallery;