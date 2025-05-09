import React, { useState, useEffect } from "react";
import { useForm, router } from "@inertiajs/react";
import Layout from "@/Layouts/layout/layout.jsx";
import { MapPin } from 'lucide-react';

const EditProperty = ({ property, errors }) => {
  const [existingImages, setExistingImages] = useState(
    property.gallery?.map(path => ({ path, url: `/storage/${path}`, removed: false })) || []
  );
  const [newImages, setNewImages] = useState([]);
  const [locationSuggestions, setLocationSuggestions] = useState([]);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);

  const { data, setData, processing } = useForm({
    property_name: property.property_name,
    type: property.type,
    price_per_night: property.price_per_night,
    max_adults: property.max_adults,
    max_children: property.max_children,
    status: property.status,
    location: property.location || "", // Add location
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('_method', 'PUT');

    Object.entries(data).forEach(([key, value]) => {
      formData.append(key, value);
    });

    router.post(route('properties.update', { property: property.id }), formData, {
      forceFormData: true,
      preserveScroll: true,
    });
  };

  const propertyTypes = [
    "Entire Apartment", "Entire House", "Private Room", "Shared Room", "Villa",
    "Cabin", "Cottage", "Treehouse", "Boat", "Tent", "Tiny House", "Bungalow",
    "Farm Stay", "Hostel", "Guesthouse", "Lighthouse", "Luxury Villa", "Penthouse",
  ];

  useEffect(() => {
    const fetchLocationSuggestions = async () => {
      if (data.location.length < 3) {
        setLocationSuggestions([]);
        return;
      }

      setIsLoadingSuggestions(true);
      try {
        const response = await fetch(`/locations?query=${encodeURIComponent(data.location)}`);
        if (!response.ok) throw new Error('Failed to fetch suggestions');
        const result = await response.json();
        setLocationSuggestions(result);
      } catch (error) {
        console.error('Error fetching location suggestions:', error);
        setLocationSuggestions([]);
      } finally {
        setIsLoadingSuggestions(false);
      }
    };

    const timeoutId = setTimeout(() => {
      if (data.location) {
        fetchLocationSuggestions();
      } else {
        setLocationSuggestions([]);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [data.location]);

  const handleLocationSelect = (suggestion) => {
    setData('location', suggestion);
    setLocationSuggestions([]);
  };

  return (
    <Layout>
      <div className="max-w-4xl bg-white p-6 rounded-lg shadow-md">
        <h1 className="text-lg font-bold mb-4">Edit Property</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            {['property_name', 'type', 'price_per_night', 'max_adults', 'max_children'].map(field => (
              <div key={field}>
                <label className="block text-sm font-medium">
                  {field.replace('_', ' ').toUpperCase()}
                </label>

                {field === 'type' ? (
                  <select
                    value={data.type}
                    onChange={(e) => setData("type", e.target.value)}
                    className="w-full border px-3 py-2 rounded"
                  >
                    <option value="">Select a property type</option>
                    {propertyTypes.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    type={field.includes('price') || field.includes('max') ? 'number' : 'text'}
                    value={data[field]}
                    onChange={(e) => setData(field, e.target.value)}
                    className="w-full border px-3 py-2 rounded"
                  />
                )}

                {errors[field] && <p className="text-red-500 text-sm">{errors[field]}</p>}
              </div>
            ))}

            {/* Location Field */}
            <div className="relative">
              <label className="block text-sm mb-2">
                <div className="flex text-left gap-4 items-center">
                  <MapPin className="w-4 h-4 mr-1" />
                  <span>Location</span>
                </div>
              </label>
              <input
                type="text"
                className="w-full p-2 rounded border border-gray-300"
                placeholder="Search for a location..."
                value={data.location}
                onChange={(e) => setData("location", e.target.value)}
              />
              {isLoadingSuggestions && (
                <div className="absolute right-3 top-2">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-500"></div>
                </div>
              )}

              {locationSuggestions.length > 0 && (
                <div className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg">
                  <ul className="max-h-60 overflow-auto py-1">
                    {locationSuggestions.map((suggestion, index) => (
                      <li
                        key={index}
                        className="px-3 py-2 text-sm hover:bg-gray-200 cursor-pointer"
                        onClick={() => handleLocationSelect(suggestion)}
                      >
                        {suggestion}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {errors.location && <p className="text-red-500 text-sm">{errors.location}</p>}
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-green-500 text-white py-2 rounded mt-4"
            disabled={processing}
          >
            {processing ? "Updating..." : "Update Property"}
          </button>
        </form>
      </div>
    </Layout>
  );
};

export default EditProperty;
