import React, { useState, useEffect } from "react";
import { useForm } from "@inertiajs/react";
import Layout from "@/Layouts/layout/layout.jsx";
import { Plus, Logs, MapPin, Star as StarIcon } from 'lucide-react'; // Optional icons

const CreateProperty = ({ errors }) => {
  const [previews, setPreviews] = useState([]);
  const [locationSuggestions, setLocationSuggestions] = useState([]);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);

  const { data, setData, post, processing } = useForm({
    property_name: "",
    type: "",
    price_per_night: "",
    max_adults: "",
    max_children: "",
    status: "available",
    location: "", // Include location in form data
  });

  const handleSubmit = (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append('property_name', data.property_name);
    formData.append('type', data.type);
    formData.append('price_per_night', data.price_per_night);
    formData.append('max_adults', data.max_adults);
    formData.append('max_children', data.max_children);
    formData.append('status', data.status);
    formData.append('location', data.location);

    post(route("properties.store"), {
      data: formData,
      forceFormData: true,
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
        <h1 className="text-lg font-bold mb-4">Create Property</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium">Property Name</label>
              <input
                type="text"
                value={data.property_name}
                onChange={(e) => setData("property_name", e.target.value)}
                className="w-full border px-3 py-2 rounded"
              />
              {errors.property_name && <p className="text-red-500 text-sm">{errors.property_name}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium">Property Type</label>
              <select
                value={data.type}
                onChange={(e) => setData("type", e.target.value)}
                className="min-w-full border px-3 py-2 rounded"
              >
                <option value="">Select type</option>
                {propertyTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
              {errors.type && <p className="text-red-500 text-sm">{errors.type}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium">Price Per Night</label>
              <input
                type="number"
                value={data.price_per_night}
                onChange={(e) => setData("price_per_night", e.target.value)}
                className="w-full border px-3 py-2 rounded"
              />
              {errors.price_per_night && <p className="text-red-500 text-sm">{errors.price_per_night}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium">Max Guests</label>
              <input
                type="number"
                value={data.max_adults}
                onChange={(e) => setData("max_adults", e.target.value)}
                className="w-full border px-3 py-2 rounded"
              />
              {errors.max_adults && <p className="text-red-500 text-sm">{errors.max_adults}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium">Max Children</label>
              <input
                type="number"
                value={data.max_children}
                onChange={(e) => setData("max_children", e.target.value)}
                className="w-full border px-3 py-2 rounded"
              />
              {errors.max_children && <p className="text-red-500 text-sm">{errors.max_children}</p>}
            </div>

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
            className="w-full bg-blue-500 text-white py-2 rounded mt-4"
            disabled={processing}
          >
            {processing ? "Saving..." : "Create Property"}
          </button>
        </form>
      </div>
    </Layout>
  );
};

export default CreateProperty;
