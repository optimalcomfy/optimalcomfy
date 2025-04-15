import React, { useState } from "react";
import axios from "axios";
import "./Gallery.css"; // Import the custom CSS file

const Feature = ({ room }) => {
  const [features, setFeatures] = useState(room?.room_features || []);
  const [showFeaturePopup, setShowFeaturePopup] = useState(false);
  const [editingFeature, setEditingFeature] = useState(null);
  const [newFeature, setNewFeature] = useState({ name: "", image: null });
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(null);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setNewFeature((prev) => ({ ...prev, image: file }));

      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewFeature((prev) => ({ ...prev, [name]: value }));
  };

  const handleUploadFeature = async () => {
    if (!newFeature.name) return;

    setIsUploading(true);
    const formData = new FormData();
    {editingFeature &&
    formData.append("_method", "PUT");}
    formData.append("name", newFeature.name);
    if (newFeature.image) {
      formData.append("icon", newFeature.image);
    }
    formData.append("room_id", room.id);

    try {
      const response = editingFeature
        ? await axios.post(`/roomFeatures/${editingFeature.id}`, formData, {
            headers: { "Content-Type": "multipart/form-data" },
          })
        : await axios.post("/roomFeatures", formData, {
            headers: { "Content-Type": "multipart/form-data" },
          });

      setFeatures(
        editingFeature
          ? features.map((feature) =>
              feature.id === editingFeature.id ? response.data.feature : feature
            )
          : [...features, response.data.feature]
      );

      setNewFeature({ name: "", image: null });
      setPreviewUrl(null);
      setEditingFeature(null);
      setShowFeaturePopup(false);
    } catch (error) {
      console.error("Upload failed:", error.response?.data || error.message);
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveFeature = async (featureId) => {
    try {
      await axios.delete(`/roomFeatures/${featureId}`);
      setFeatures(features.filter((feature) => feature.id !== featureId));
    } catch (error) {
      console.error("Delete failed:", error);
    }
  };

  const handleEditFeature = (feature) => {
    setNewFeature({ name: feature.name, image: null });
    setPreviewUrl(`/storage/${feature?.icon}`);
    setEditingFeature(feature);
    setShowFeaturePopup(true);
  };

  return (
    <div className="gallery-container">
      <div className="gallery-header">
        <h2>Room Features</h2>
        <button onClick={() => setShowFeaturePopup(true)} className="add-image-btn">
          Add New Feature
        </button>
      </div>

      {features.length === 0 ? (
        <p className="no-gallery">No features added yet.</p>
      ) : (
        <div className="gallery-grid">
          {features.map((feature) => (
            <div key={feature?.id} className="gallery-item p-4 gap-4">
              <img src={`/storage/${feature?.icon}`} alt={feature?.name} className="gallery-img" />
              <p className="mt-4">{feature?.name}</p>
              <button onClick={() => handleEditFeature(feature)} className="edit-btn bg-green-500 w-full p-2 rounded-md">
                Edit
              </button>
              <button onClick={() => handleRemoveFeature(feature.id)} className="delete-btn">
                Delete
              </button>
            </div>
          ))}
        </div>
      )}

      {showFeaturePopup && (
        <div className="gallery-popup">
          <div className="popup-content flex flex-col items-start justify-start gap-4">
            <h2>{editingFeature ? "Edit Feature" : "Add Feature"}</h2>
            <input
              type="text"
              name="name"
              placeholder="Feature Name"
              value={newFeature.name}
              onChange={handleInputChange}
              className="name-input w-full"
            />
            {previewUrl && <img src={previewUrl} alt="Preview" className="preview-img" />}
            <input type="file" onChange={handleFileChange} className="file-input" />
            <button onClick={handleUploadFeature} className="upload-btn w-full" disabled={isUploading}>
              {isUploading ? "Uploading..." : editingFeature ? "Update" : "Upload"}
            </button>
            <button onClick={() => { setShowFeaturePopup(false); setEditingFeature(null); }} className="cancel-btn w-full bg-slate-100 py-2">
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Feature;
