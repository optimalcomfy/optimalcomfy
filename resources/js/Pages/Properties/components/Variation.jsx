import React, { useState, useEffect } from "react";
import axios from "axios";
import "./Variation.css"; // Custom CSS for the component

const Variation = ({ property }) => {
  const [variations, setVariations] = useState([]);
  const [showVariationPopup, setShowVariationPopup] = useState(false);
  const [editingVariation, setEditingVariation] = useState(null);
  const [newVariation, setNewVariation] = useState({ 
    type: "", 
    price: "",
    property_id: property?.id || ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch variations when property changes
  useEffect(() => {
    if (property?.id) {
      fetchVariations();
    }
  }, [property?.id]);

  const fetchVariations = async () => {
    try {
      const response = await axios.get(`/properties/${property.id}/variation`);
      setVariations(response.data);
    } catch (error) {
      console.error("Failed to fetch variations:", error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewVariation((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmitVariation = async () => {
    if (!newVariation.type) return;

    setIsSubmitting(true);
    
    try {
      const payload = {
        type: newVariation.type,
        price: newVariation.price,
        property_id: newVariation.property_id
      };

      const payload2 = {
        type: newVariation.type,
        price: newVariation.price,
        property_id: newVariation.property_id,
        id:editingVariation.id
      };

      if (editingVariation) {
        await axios.put(`/propertyVariations/${editingVariation.id}`, payload2);
      } else {
        await axios.post("/propertyVariations", payload);
      }

      // Refresh the variations list after successful operation
      await fetchVariations();
      resetForm();
    } catch (error) {
      console.error("Operation failed:", error.response?.data || error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRemoveVariation = async (variationId) => {
    try {
      await axios.delete(`/propertyVariations/${variationId}`);
      await fetchVariations();
    } catch (error) {
      console.error("Delete failed:", error);
    }
  };

  const handleEditVariation = (variation) => {
    setNewVariation({
      type: variation.type,
      price: variation.price,
      property_id: variation.property_id
    });
    setEditingVariation(variation);
    setShowVariationPopup(true);
  };

  const resetForm = () => {
    setNewVariation({ type: "", price: "", property_id: property?.id || "" });
    setEditingVariation(null);
    setShowVariationPopup(false);
  };

  return (
    <div className="variation-container">
      <div className="variation-header">
        <h2>Property Variations</h2>
        <button 
          onClick={() => setShowVariationPopup(true)} 
          className="add-variation-btn"
        >
          + Add New Variation
        </button>
      </div>

      {variations.length === 0 ? (
        <div className="empty-state">
          <p>No variations added yet.</p>
        </div>
      ) : (
        <div className="variation-table">
          <table>
            <thead>
              <tr>
                <th>Type</th>
                <th>Price</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {variations.map((variation) => (
                <tr key={variation.id}>
                  <td>{variation.type}</td>
                  <td>{variation.price ? `${variation.price}` : '-'}</td>
                  <td className="actions">
                    <button 
                      onClick={() => handleEditVariation(variation)}
                      className="edit-btn my-auto"
                    >
                      Edit
                    </button>
                    <button 
                      onClick={() => handleRemoveVariation(variation.id)}
                      className="delete-btn my-auto"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showVariationPopup && (
        <div className="variation-modal">
          <div className="modal-content">
            <h3>{editingVariation ? "Edit Variation" : "Add New Variation"}</h3>
            
            <div className="form-group">
              <label>Type *</label>
              <input
                type="text"
                name="type"
                placeholder="e.g., Standard, Deluxe, Premium"
                value={newVariation.type}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Price</label>
              <input
                type="number"
                name="price"
                placeholder="Enter price"
                value={newVariation.price}
                onChange={handleInputChange}
              />
            </div>

            <div className="modal-actions">
              <button 
                onClick={handleSubmitVariation} 
                disabled={isSubmitting || !newVariation.type}
                className="submit-btn"
              >
                {isSubmitting ? "Processing..." : editingVariation ? "Update" : "Save"}
              </button>
              <button onClick={resetForm} className="cancel-btn">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Variation;