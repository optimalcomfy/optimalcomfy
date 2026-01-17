import React, { useState, useEffect } from "react";
import axios from "axios";
import { router } from "@inertiajs/react";
import "./Gallery.css";

const Amenity = ({ property, amenities }) => {
  const [propertyAmenities, setPropertyAmenities] = useState(property?.property_amenities || []);
  const [loadingAmenities, setLoadingAmenities] = useState({});

  // More reliable way to check if an amenity is selected
  const isAmenitySelected = (id) => {
    return propertyAmenities.some((a) => a.amenity_id === id || a.id === id);
  };

  // Toggle amenity selection with loading state for better UX
  const toggleAmenity = async (amenity) => {
    const selected = isAmenitySelected(amenity.id);
  
    // Set loading state for this specific amenity
    setLoadingAmenities(prev => ({ ...prev, [amenity.id]: true }));
  
    try {
      if (selected) {
        const propertyAmenity = propertyAmenities.find(
          pa => pa.amenity_id === amenity.id || (pa.amenity && pa.amenity.id === amenity.id)
        );
  
        if (propertyAmenity) {
          await router.delete(route("propertyAmenities.destroy", propertyAmenity.id), {
            preserveScroll: true,
            onSuccess: () => {
              setPropertyAmenities(prev => prev.filter(pa => pa.id !== propertyAmenity.id));
            },
          });
        }
      } else {
        const response = await axios.post(route("propertyAmenities.store"), {
          amenity_id: amenity.id,
          property_id: property.id,
        });
  
        if (response.data && response.data.amenity) {
          setPropertyAmenities(prev => [...prev, response.data.amenity]);
        }
      }
  
    } catch (error) {
      console.error("Amenity toggle failed:", error);
    } finally {
      setLoadingAmenities(prev => ({ ...prev, [amenity.id]: false }));
    }
  };
  

  return (
    <div className="gallery-container">
      <div className="gallery-header">
        <h2>Stay Amenities</h2>
      </div>

      <div className="gallery-grid">
        {amenities.map((amenity) => (
          <div key={amenity.id} className="gallery-item p-4 flex flex-col gap-2 items-start">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={isAmenitySelected(amenity.id)}
                onChange={() => toggleAmenity(amenity)}
                disabled={loadingAmenities[amenity.id]}
                className="form-checkbox text-blue-600 outline border rounded-md border-blue-400"
              />
              {loadingAmenities[amenity.id] ? (
                <span className="loading-spinner h-5"></span>
              ) : (
                <i className={`${amenity.icon} w-5`}></i>
              )}
              <span className={loadingAmenities[amenity.id] ? "text-gray-400" : ""}>
                {amenity.name}
              </span>
            </label>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Amenity;