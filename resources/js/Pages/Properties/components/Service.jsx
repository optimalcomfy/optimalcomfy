import React, { useState } from "react";
import axios from "axios";
import "./Gallery.css"; // Import the custom CSS file

const Service = ({ property }) => {
  const [services, setServices] = useState(property?.property_services || []);
  const [showServicePopup, setShowServicePopup] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [newService, setNewService] = useState({ name: "", price: "", image: null });
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(null);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setNewService((prev) => ({ ...prev, image: file }));

      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewService((prev) => ({ ...prev, [name]: value }));
  };

  const handleUploadService = async () => {
    if (!newService.name || !newService.price) return;
  
    setIsUploading(true);
    const formData = new FormData();
    {editingService &&
    formData.append("_method", 'PUT');}
    formData.append("name", newService.name);
    formData.append("price", newService.price);
    if (newService.image) {
      formData.append("icon", newService.image);
    }
    formData.append("property_id", property.id);
  
    try {
      const response = editingService
        ? await axios.post(
            `/PropertyServices/${editingService.id}`,  
            formData,
            {
              headers: {
                "Content-Type": "multipart/form-data",
              },
            }
          )
        : await axios.post("/PropertyServices", formData, {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          });
  
      setServices(
        editingService
          ? services.map((service) =>
              service.id === editingService.id ? response.data.service : service
            )
          : [...services, response.data.service]
      );
      
      setNewService({ name: "", price: "", image: null });
      setPreviewUrl(null);
      setEditingService(null);
      setShowServicePopup(false);
    } catch (error) {
      console.error("Upload failed:", error.response?.data || error.message);
    } finally {
      setIsUploading(false);
    }
  };
  

  const handleRemoveService = async (serviceId) => {
    try {
      await axios.delete(route("properties.services.destroy", serviceId));
      setServices(services.filter((service) => service.id !== serviceId));
    } catch (error) {
      console.error("Delete failed:", error);
    }
  };

  const handleEditService = (service) => {
    setNewService({ name: service.name, price: service.price, image: null });
    setPreviewUrl(`/storage/${service?.icon}`);
    setEditingService(service);
    setShowServicePopup(true);
  };

  return (
    <div className="gallery-container">
      <div className="gallery-header">
        <h2>Property Services</h2>
        <button onClick={() => setShowServicePopup(true)} className="add-image-btn">
          Add New Service
        </button>
      </div>

      {services.length === 0 ? (
        <p className="no-gallery">No services added yet.</p>
      ) : (
        <div className="gallery-grid">
          {services && services?.map((service) => (
            <div key={service?.id} className="gallery-item p-4 gap-4">
              <img src={`/storage/${service?.icon}`} alt={service?.name} className="gallery-img" />
              <p className="mt-4">{service?.name}</p>
              <p className="gallery-price">KES {service?.price}</p>
              <button onClick={() => handleEditService(service)} className="edit-btn bg-green-500 w-full p-2 rounded-md">Edit</button>
              <button onClick={() => handleRemoveService(service.id)} className="delete-btn">Delete</button>
            </div>
          ))}
        </div>
      )}

      {showServicePopup && (
        <div className="gallery-popup">
          <div className="popup-content flex flex-col items-start justify-start gap-4">
            <h2>{editingService ? "Edit Service" : "Add Service"}</h2>
            <input
              type="text"
              name="name"
              placeholder="Service Name"
              value={newService.name}
              onChange={handleInputChange}
              className="name-input w-full"
            />
            <input
              type="text"
              name="price"
              placeholder="Service Price"
              value={newService.price}
              onChange={handleInputChange}
              className="price-input w-full"
            />
            {previewUrl && <img src={previewUrl} alt="Preview" className="preview-img" />}
            <input type="file" onChange={handleFileChange} className="file-input" />
            <button onClick={handleUploadService} className="upload-btn w-full" disabled={isUploading}>
              {isUploading ? "Uploading..." : editingService ? "Update" : "Upload"}
            </button>
            <button onClick={() => { setShowServicePopup(false); setEditingService(null); }} className="cancel-btn w-full bg-slate-100 py-2">
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Service;
