import React, { useState } from "react";
import axios from "axios";
import { router } from "@inertiajs/react";
import "./Gallery.css";

const CarFeature = ({ car, features }) => {
    // Ensure car?.car_features is always an array to avoid errors if null/undefined
    const [carFeatures, setCarFeatures] = useState(car?.car_features || []);
    const [loadingFeatures, setLoadingFeatures] = useState({});
  
    // Corrected: Check if a feature is selected by comparing feature.id with carFeature.feature_id
    const isFeatureSelected = (featureId) => {
      return carFeatures.some(carFeature => carFeature.feature_id === featureId);
    };
  
    // Corrected: Find the car_feature relationship object by feature ID
    const findCarFeatureRelationship = (featureId) => {
      return carFeatures.find(cf => cf.feature_id === featureId);
    };
  
    const toggleFeature = async (feature) => {
      const selected = isFeatureSelected(feature.id);
  
      setLoadingFeatures(prev => ({ ...prev, [feature.id]: true }));
  
      try {
        if (selected) {
          const carFeature = findCarFeatureRelationship(feature.id);
  
          if (carFeature) {
            // Make the DELETE request using the ID of the CarFeature relationship
            await router.delete(route("carFeatures.destroy", carFeature.id));
  
            // Update local state by removing the deleted relationship using its ID
            setCarFeatures(prev => prev.filter(cf => cf.id !== carFeature.id));
          }
        } else {
          // Add the feature
          const response = await axios.post(route("carFeatures.store"), {
            feature_id: feature.id,
            car_id: car.id,
          });
  
          // Assuming the backend returns the created CarFeature pivot model directly in response.data
          // If your backend wraps it, e.g., { carFeature: {...} }, adjust response.data accordingly

          if (response.data?.success) {
             // Assuming response.data is the created CarFeature pivot model
             setCarFeatures(prev => [...prev, response.data?.feature]);
          } else {
             console.error("Store request succeeded but no data returned");
             // You might need to re-fetch or handle this case differently
          }
        }
      } catch (error) {
        console.error("Feature toggle failed:", error);
        // Implement user-facing error notification
      } finally {
        setLoadingFeatures(prev => ({ ...prev, [feature.id]: false }));
      }
    };
  
    return (
      <div className="gallery-container">
        <div className="gallery-header">
          <h2>Car Features</h2>
        </div>
  
        <div className="gallery-grid">
          {features.length > 0 ? (
            features.map((feature) => (
              <div key={feature.id} className="gallery-item p-4 flex flex-col gap-2 items-start">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    // Now uses the corrected check
                    checked={isFeatureSelected(feature.id)}
                    onChange={() => toggleFeature(feature)}
                    disabled={loadingFeatures[feature.id]}
                    className="form-checkbox h-5 text-blue-600 outline border rounded-md border-blue-400"
                  />
                  {loadingFeatures[feature.id] ? (
                    // Simple loading indicator placeholder
                    <span className="w-5 h-5 inline-block border-t-2 border-r-2 border-blue-peach rounded-full animate-spin"></span>
                  ) : (
                    <i className={`${feature.icon} w-5 text-blue-600`}></i> // Added text-blue-600 for icon color consistency
                  )}
                  <span className={loadingFeatures[feature.id] ? "text-gray-400" : ""}>
                    {feature.name}
                  </span>
                </label>
              </div>
            ))
          ) : (
            <p>No features available.</p> // Handle case where features is empty
          )}
        </div>
      </div>
    );
  };
  
  export default CarFeature;