import React, { useState, useEffect } from "react";
import axios from "axios";
import "./Gallery.css";

const CarGallery = ({ car }) => {
  const [galleryImages, setGalleryImages] = useState([]);
  const [showGalleryPopup, setShowGalleryPopup] = useState(false);
  const [newImage, setNewImage] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(null);

  // Fetch media for this car when component mounts
  useEffect(() => {
    if (car && car.id) {
      fetchCarMedia();
    }
  }, [car]);

  const fetchCarMedia = async () => {
    try {
      const response = await axios.get(`/api/car-media/by-car/${car.id}`);
      setGalleryImages(response.data);
    } catch (error) {
      console.error("Failed to fetch car media:", error);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setNewImage(file);

      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUploadImage = async () => {
    if (!newImage) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append("image", newImage);
    formData.append("car_id", car.id);

    try {
      const response = await axios.post("/carMedias", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      
      // Add the newly created media to our gallery images
      if (response.data.success) {
        setGalleryImages([...galleryImages, response.data.media]);
        setNewImage(null);
        setPreviewUrl(null);
        setShowGalleryPopup(false);
      }
    } catch (error) {
      console.error("Upload failed:", error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveImage = async (mediaId) => {
    try {
      const response = await axios.delete(`/carMedias/${mediaId}`);
      if (response.data.success) {
        setGalleryImages(galleryImages.filter((img) => img.id !== mediaId));
      }
    } catch (error) {
      console.error("Delete failed:", error);
    }
  };

  return (
    <div className="gallery-container">
      <div className="gallery-header">
        <h2>Car Gallery</h2>
        <button onClick={() => setShowGalleryPopup(true)} className="add-image-btn">
          Add New Image
        </button>
      </div>

      {galleryImages.length === 0 ? (
        <p className="no-images">No images in gallery yet.</p>
      ) : (
        <div className="gallery-grid">
          {galleryImages.map((mediaItem) => (
            <div key={mediaItem.id} className="gallery-item">
              <img src={`/storage/${mediaItem.image}`} alt="car" className="gallery-img" />
              <button onClick={() => handleRemoveImage(mediaItem.id)} className="delete-btn">
                Delete
              </button>
            </div>
          ))}
        </div>
      )}

      {showGalleryPopup && (
        <div className="gallery-popup">
          <div className="popup-content flex flex-col items-start justify-start gap-4">
            <h2>Add Image to Gallery</h2>
            <div className="flex items-center justify-between w-full">
              <button 
                onClick={() => {
                  setShowGalleryPopup(false);
                  setPreviewUrl(null);
                  setNewImage(null);
                }} 
                className="cancel-btn"
              >
                Cancel
              </button>
              <h3>Upload New Image</h3>
              <div></div> {/* Empty div for flex spacing */}
            </div>
            {previewUrl && <img src={previewUrl} alt="Preview" className="preview-img" />}
            <input type="file" onChange={handleFileChange} className="file-input" accept="image/*" />
            <button 
              onClick={handleUploadImage} 
              className="upload-btn w-full" 
              disabled={isUploading || !newImage}
            >
              {isUploading ? "Uploading..." : "Upload"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CarGallery;