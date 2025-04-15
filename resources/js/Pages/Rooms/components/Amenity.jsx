import React, { useState } from "react";
import axios from "axios";
import { router } from "@inertiajs/react";
import "./Gallery.css"; 

const Amenity = ({ room }) => {
  const [amenities, setAmenities] = useState(room?.room_amenities || []);
  const [showAmenityPopup, setShowAmenityPopup] = useState(false);
  const [newAmenity, setNewAmenity] = useState({ name: "", image: null });
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(null);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setNewAmenity((prev) => ({ ...prev, image: file }));

      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleInputChange = (e) => {
    setNewAmenity((prev) => ({ ...prev, name: e.target.value }));
  };

  const handleUploadAmenity = async () => {
    if (!newAmenity.name || !newAmenity.image) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append("name", newAmenity.name);
    formData.append("icon", newAmenity.image);
    formData.append("room_id", room.id);

    try {
      const response = await axios.post(route("rooms.amenities.store"), formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setAmenities([...amenities, response.data.amenity]);
      setNewAmenity({ name: "", image: null });
      setPreviewUrl(null);
      setShowAmenityPopup(false);
    } catch (error) {
      console.error("Upload failed:", error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveAmenity = async (amenityId) => {
    try {
      router.delete(route('roomAmenities.destroy', amenityId));
      setAmenities((prevAmenities) => prevAmenities.filter((amenity) => amenity.id !== amenityId));
    } catch (error) {
      console.error("Delete failed:", error.response?.data || error.message);
    }
  };  

  return (
    <div className="gallery-container">
      <div className="gallery-header">
        <h2>Room Amenities</h2>

        <button onClick={() => setShowAmenityPopup(true)} className="add-image-btn">
          Add amenity
        </button>
      </div>

      {amenities.length === 0 ? (
        <p className="no-images">No amenities added yet.</p>
      ) : (
        <div className="gallery-grid">
          {amenities.map((amenity) => (
            <div key={amenity.id} className="gallery-item p-4 flex flex-col gap-4">
              <img src={`/storage/${amenity.icon}`} alt={amenity.name} className="gallery-img" />
              <p>{amenity.name}</p>
              <button onClick={() => handleRemoveAmenity(amenity.id)} className="delete-btn">
                Delete
              </button>
            </div>
          ))}
        </div>
      )}

      {showAmenityPopup && (
        <div className="gallery-popup">
          <div className="popup-content flex flex-col items-start justify-start gap-4">
            <h2>Add Amenity</h2>
            <input
              type="text"
              placeholder="Amenity Name"
              value={newAmenity.name}
              onChange={handleInputChange}
              className="name-input"
            />
            {previewUrl && <img src={previewUrl} alt="Preview" className="preview-img" />}
            <input type="file" onChange={handleFileChange} className="file-input" />
            <button onClick={handleUploadAmenity} className="upload-btn w-full" disabled={isUploading}>
              {isUploading ? "Uploading..." : "Upload"}
            </button>

            <button onClick={()=>setShowAmenityPopup(false)} className="upload-btn w-full bg-gray-100 text-gray-900" disabled={isUploading}>
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Amenity;