import React, { useState } from "react";
import axios from "axios";
import "./Gallery.css"; 

const Gallery = ({ property }) => {
  const [galleryImages, setGalleryImages] = useState(property?.initial_gallery);
  const [showGalleryPopup, setShowGalleryPopup] = useState(false);
  const [newImage, setNewImage] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(null);

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
    formData.append("property_id", property.id);

    try {
      const response = await axios.post(route("properties.gallery.store"), formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setGalleryImages([...galleryImages, response.data.gallery]);
      setNewImage(null);
      setPreviewUrl(null);
      setShowGalleryPopup(false);
    } catch (error) {
      console.error("Upload failed:", error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveImage = async (galleryId) => {
    try {
      await axios.delete(route("properties.gallery.destroy", galleryId));
      setGalleryImages(galleryImages.filter((img) => img.id !== galleryId));
    } catch (error) {
      console.error("Delete failed:", error);
    }
  };

  return (
    <div className="gallery-container">
      <div className="gallery-header">
        <h2>Stay Gallery</h2>
        <button onClick={() => setShowGalleryPopup(true)} className="add-image-btn">
          Add New Image
        </button>
      </div>

      {galleryImages.length === 0 ? (
        <p className="no-images">No images in gallery yet.</p>
      ) : (
        <div className="gallery-grid">
          {galleryImages.map((galleryItem) => (
            <div key={galleryItem.id} className="gallery-item">
              <img src={`/storage/${galleryItem.image}`} alt="Property" className="gallery-img" />
              <button onClick={() => handleRemoveImage(galleryItem.id)} className="delete-btn">
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
            {previewUrl && <img src={previewUrl} alt="Preview" className="preview-img" />}
            <input type="file" onChange={handleFileChange} className="file-input" />
            <button onClick={handleUploadImage} className="upload-btn w-full" disabled={isUploading}>
              {isUploading ? "Uploading..." : "Upload"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Gallery;
