import React, { useState, useEffect } from "react";
import { useForm, router, usePage } from "@inertiajs/react";
import Layout from "@/Layouts/layout/layout.jsx";
import { MapPin, Wifi, Key, Utensils, Sparkles, Phone } from 'lucide-react';

const EditProperty = ({ property, errors }) => {
  const [existingImages, setExistingImages] = useState(
    property.gallery?.map(path => ({ path, url: `/storage/${path}`, removed: false })) || []
  );
  const [newImages, setNewImages] = useState([]);
  const [locationSuggestions, setLocationSuggestions] = useState([]);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  const { company } = usePage().props;
  const [hostEarnings, setHostEarnings] = useState(0);

  const { data, setData, processing } = useForm({
    property_name: property.property_name,
    type: property.type,
    amount: property.amount, // Calculate original amount
    price_per_night: property.price_per_night,
    max_adults: property.max_adults,
    max_children: property.max_children,
    status: property.status,
    location: property.location || "",
    wifi_password: property.wifi_password || "",
    cook: property.cook || "",
    cleaner: property.cleaner || "",
    emergency_contact: property.emergency_contact || "",
    key_location: property.key_location || "",
    apartment_name: property.apartment_name || "",
    block: property.block || "",
    house_number: property.house_number || "",
    lock_box_location: property.lock_box_location || "",
    wifi_name: property.wifi_name || "",
  });

  // Calculate host earnings whenever amount changes
  useEffect(() => {
    if (data.amount && company.percentage) {
      const amount = parseFloat(data.amount);
      const platformFee = amount * (company.percentage / 100);
      const earnings = amount + platformFee;
      setHostEarnings(earnings);
      setData('price_per_night', earnings.toFixed(2));
    } else {
      setHostEarnings(0);
      setData('price_per_night', "");
    }
  }, [data.amount, company.percentage]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('_method', 'PUT');

    Object.entries(data).forEach(([key, value]) => {
      if (value !== null && value !== undefined) {
        formData.append(key, value);
      }
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
        <h1 className="text-2xl font-bold mb-6 text-gray-800">Edit Property Listing</h1>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Property Basic Information */}
            <div className="space-y-6 flex-1">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Property Name</label>
                <input
                  type="text"
                  value={data.property_name}
                  onChange={(e) => setData("property_name", e.target.value)}
                  className="w-full border border-gray-300 px-4 py-2 rounded-lg focus:ring-2 focus:ring-peach focus:border-transparent"
                />
                {errors.property_name && <p className="text-red-500 text-sm mt-1">{errors.property_name}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Property Type</label>
                <select
                  value={data.type}
                  onChange={(e) => setData("type", e.target.value)}
                  className="w-full border border-gray-300 px-4 py-2 rounded-lg focus:ring-2 focus:ring-peach focus:border-transparent"
                >
                  <option value="">Select property type</option>
                  {propertyTypes.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
                {errors.type && <p className="text-red-500 text-sm mt-1">{errors.type}</p>}
              </div>

              <div className="relative">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <div className="flex items-center">
                    <MapPin className="w-4 h-4 mr-2" />
                    <span>Location</span>
                  </div>
                </label>
                <input
                  type="text"
                  className="w-full border border-gray-300 px-4 py-2 rounded-lg focus:ring-2 focus:ring-peach focus:border-transparent"
                  placeholder="Search for a location..."
                  value={data.location}
                  onChange={(e) => setData("location", e.target.value)}
                />
                {isLoadingSuggestions && (
                  <div className="absolute right-3 top-9">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-500"></div>
                  </div>
                )}

                {locationSuggestions.length > 0 && (
                  <div className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg">
                    <ul className="max-h-60 overflow-auto py-1">
                      {locationSuggestions.map((suggestion, index) => (
                        <li
                          key={index}
                          className="px-3 py-2 text-sm hover:bg-gray-100 cursor-pointer"
                          onClick={() => handleLocationSelect(suggestion)}
                        >
                          {suggestion}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {errors.location && <p className="text-red-500 text-sm mt-1">{errors.location}</p>}
              </div>
            </div>

            {/* Pricing Information */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-medium text-gray-800 mb-3">Pricing Details</h3>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Listing Price (KES)</label>
                <input
                  type="number"
                  value={data.amount}
                  onChange={(e) => setData("amount", e.target.value)}
                  className="w-full border border-gray-300 px-4 py-2 rounded-lg focus:ring-2 focus:ring-peach focus:border-transparent"
                />
                {errors.amount && <p className="text-red-500 text-sm mt-1">{errors.amount}</p>}
              </div>

              <div className="bg-white p-3 rounded-md border border-gray-200 mb-4">
                <div className="flex justify-between text-sm font-medium text-gray-800">
                  <span>You'll receive:</span>
                  <span className="text-green-600">KES {data.amount}</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Guest Price (KES)</label>
                <input
                  type="number"
                  value={data.price_per_night}
                  readOnly
                  className="w-full border border-gray-300 bg-gray-100 px-4 py-2 rounded-lg cursor-not-allowed"
                />
                <p className="text-xs text-gray-500 mt-1">This is the price guests will pay after platform fees</p>
              </div>
            </div>
          </div>

          {/* Capacity Information */}
          <div className="grid md:grid-cols-2 gap-6">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">Max Adults</label>
              <input
                type="number"
                value={data.max_adults}
                onChange={(e) => setData("max_adults", e.target.value)}
                className="w-full border border-gray-300 px-4 py-2 rounded-lg focus:ring-2 focus:ring-peach focus:border-transparent"
                min="1"
              />
              {errors.max_adults && <p className="text-red-500 text-sm mt-1">{errors.max_adults}</p>}
            </div>

            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">Max Children</label>
              <input
                type="number"
                value={data.max_children}
                onChange={(e) => setData("max_children", e.target.value)}
                className="w-full border border-gray-300 px-4 py-2 rounded-lg focus:ring-2 focus:ring-peach focus:border-transparent"
                min="0"
              />
              {errors.max_children && <p className="text-red-500 text-sm mt-1">{errors.max_children}</p>}
            </div>
          </div>

          {/* Additional Information Section */}
          <div className="border-t border-gray-200 pt-6">
            <h3 className="text-lg font-medium text-gray-800 mb-4">Additional Information</h3>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div className="lg:w-[46%]">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <div className="flex items-center">
                    <Wifi className="w-4 h-4 mr-2" />
                    <span>WiFi name</span>
                  </div>
                </label>
                <input
                  type="text"
                  value={data.wifi_name}
                  onChange={(e) => setData("wifi_name", e.target.value)}
                  className="w-full border border-gray-300 px-4 py-2 rounded-lg focus:ring-2 focus:ring-peach focus:border-transparent"
                  placeholder="Optional"
                />
              </div>

              <div className="lg:w-[46%]">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <div className="flex items-center">
                    <Wifi className="w-4 h-4 mr-2" />
                    <span>WiFi Password</span>
                  </div>
                </label>
                <input
                  type="text"
                  value={data.wifi_password}
                  onChange={(e) => setData("wifi_password", e.target.value)}
                  className="w-full border border-gray-300 px-4 py-2 rounded-lg focus:ring-2 focus:ring-peach focus:border-transparent"
                  placeholder="Optional"
                />
              </div>

              <div className="lg:w-[46%]">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <div className="flex items-center">
                    <Key className="w-4 h-4 mr-2" />
                    <span>Apartment name</span>
                  </div>
                </label>
                <input
                  type="text"
                  value={data.apartment_name}
                  onChange={(e) => setData("apartment_name", e.target.value)}
                  className="w-full border border-gray-300 px-4 py-2 rounded-lg focus:ring-2 focus:ring-peach focus:border-transparent"
                  placeholder="Where guests can find the key"
                />
              </div>

              <div className="lg:w-[46%]">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <div className="flex items-center">
                    <Key className="w-4 h-4 mr-2" />
                    <span>Block</span>
                  </div>
                </label>
                <input
                  type="text"
                  value={data.block}
                  onChange={(e) => setData("block", e.target.value)}
                  className="w-full border border-gray-300 px-4 py-2 rounded-lg focus:ring-2 focus:ring-peach focus:border-transparent"
                  placeholder="Where guests can find the key"
                />
              </div>


              <div className="lg:w-[46%]">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <div className="flex items-center">
                    <Key className="w-4 h-4 mr-2" />
                    <span>House number</span>
                  </div>
                </label>
                <input
                  type="text"
                  value={data.house_number}
                  onChange={(e) => setData("house_number", e.target.value)}
                  className="w-full border border-gray-300 px-4 py-2 rounded-lg focus:ring-2 focus:ring-peach focus:border-transparent"
                  placeholder="Where guests can find the key"
                />
              </div>

              <div className="lg:w-[46%]">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <div className="flex items-center">
                    <Key className="w-4 h-4 mr-2" />
                    <span>Lock box location</span>
                  </div>
                </label>
                <input
                  type="text"
                  value={data.lock_box_location}
                  onChange={(e) => setData("lock_box_location", e.target.value)}
                  className="w-full border border-gray-300 px-4 py-2 rounded-lg focus:ring-2 focus:ring-peach focus:border-transparent"
                  placeholder="Where guests can find the key"
                />
              </div>

              <div className="lg:w-[46%]">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <div className="flex items-center">
                    <Key className="w-4 h-4 mr-2" />
                    <span>Key Location</span>
                  </div>
                </label>
                <input
                  type="text"
                  value={data.key_location}
                  onChange={(e) => setData("key_location", e.target.value)}
                  className="w-full border border-gray-300 px-4 py-2 rounded-lg focus:ring-2 focus:ring-peach focus:border-transparent"
                  placeholder="Where guests can find the key"
                />
              </div>

              <div className="lg:w-[46%]">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <div className="flex items-center">
                    <Utensils className="w-4 h-4 mr-2" />
                    <span>Cook Available</span>
                  </div>
                </label>
                <input
                  type="text"
                  value={data.cook}
                  onChange={(e) => setData("cook", e.target.value)}
                  className="w-full border border-gray-300 px-4 py-2 rounded-lg focus:ring-2 focus:ring-peach focus:border-transparent"
                  placeholder="Name or details (optional)"
                />
              </div>

              <div className="lg:w-[46%]">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <div className="flex items-center">
                    <Sparkles className="w-4 h-4 mr-2" />
                    <span>Cleaner Available</span>
                  </div>
                </label>
                <input
                  type="text"
                  value={data.cleaner}
                  onChange={(e) => setData("cleaner", e.target.value)}
                  className="w-full border border-gray-300 px-4 py-2 rounded-lg focus:ring-2 focus:ring-peach focus:border-transparent"
                  placeholder="Name or details (optional)"
                />
              </div>

              <div className="lg:w-[46%]">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <div className="flex items-center">
                    <Phone className="w-4 h-4 mr-2" />
                    <span>Emergency Contact</span>
                  </div>
                </label>
                <input
                  type="text"
                  value={data.emergency_contact}
                  onChange={(e) => setData("emergency_contact", e.target.value)}
                  className="w-full border border-gray-300 px-4 py-2 rounded-lg focus:ring-2 focus:ring-peach focus:border-transparent"
                  placeholder="Contact person in case of emergencies"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-center pt-4">
            <button
              type="submit"
              className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-6 rounded-lg transition duration-200 flex items-center"
              disabled={processing}
            >
              {processing ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Updating...
                </>
              ) : (
                "Update Property Listing"
              )}
            </button>
          </div>
        </form>
      </div>
    </Layout>
  );
};

export default EditProperty;